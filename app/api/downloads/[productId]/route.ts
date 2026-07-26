import { NextResponse } from "next/server";
import { authorizeProductDownload } from "@/lib/downloads/authorize-download";
import {
  DOWNLOAD_RATE_LIMIT_MESSAGE,
  DOWNLOAD_UNAVAILABLE_MESSAGE,
  SIGNED_URL_EXPIRY_SECONDS,
} from "@/lib/downloads/constants";
import { logDownloadEvent } from "@/lib/downloads/log-event";
import { checkDownloadRateLimit } from "@/lib/downloads/rate-limit";
import { createArtworkSignedDownloadUrl } from "@/lib/downloads/signed-url";
import { getAuthenticatedUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ productId: string }>;
};

function noStoreJson(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    return first || null;
  }

  return request.headers.get("x-real-ip");
}

export async function POST(request: Request, context: RouteContext) {
  const { productId } = await context.params;
  const user = await getAuthenticatedUser();
  const userAgent = request.headers.get("user-agent");
  const ipAddress = getClientIp(request);

  if (!user) {
    return noStoreJson({ error: DOWNLOAD_UNAVAILABLE_MESSAGE }, 401);
  }

  const rateLimit = checkDownloadRateLimit(user.id);

  if (!rateLimit.allowed) {
    await logDownloadEvent({
      userId: user.id,
      productId,
      outcome: "rate_limited",
      ipAddress,
      userAgent,
    });

    return noStoreJson(
      {
        error: DOWNLOAD_RATE_LIMIT_MESSAGE,
        retryAfterMs: rateLimit.retryAfterMs,
      },
      429,
    );
  }

  const authorization = await authorizeProductDownload(productId);

  if (!authorization.ok) {
    const outcome =
      authorization.reason === "unauthenticated"
        ? "unauthorized"
        : authorization.reason === "not_found"
          ? "not_found"
          : "forbidden";

    await logDownloadEvent({
      userId: user.id,
      productId,
      outcome,
      ipAddress,
      userAgent,
    });

    const status =
      authorization.reason === "unauthenticated"
        ? 401
        : authorization.reason === "not_found"
          ? 404
          : 403;

    return noStoreJson({ error: DOWNLOAD_UNAVAILABLE_MESSAGE }, status);
  }

  const signed = await createArtworkSignedDownloadUrl(
    authorization.download.storagePath,
  );

  if ("error" in signed) {
    if (signed.error === "missing") {
      await logDownloadEvent({
        userId: user.id,
        productId: authorization.download.productId,
        entitlementId: authorization.download.entitlementId,
        outcome: "file_missing",
        ipAddress,
        userAgent,
      });

      return noStoreJson({ error: DOWNLOAD_UNAVAILABLE_MESSAGE }, 404);
    }

    await logDownloadEvent({
      userId: user.id,
      productId: authorization.download.productId,
      entitlementId: authorization.download.entitlementId,
      outcome: "sign_failed",
      ipAddress,
      userAgent,
    });

    return noStoreJson({ error: DOWNLOAD_UNAVAILABLE_MESSAGE }, 500);
  }

  await logDownloadEvent({
    userId: user.id,
    productId: authorization.download.productId,
    entitlementId: authorization.download.entitlementId,
    outcome: "signed_url_issued",
    ipAddress,
    userAgent,
  });

  return noStoreJson(
    {
      url: signed.url,
      filename: authorization.download.filename,
      expiresIn: SIGNED_URL_EXPIRY_SECONDS,
    },
    200,
  );
}
