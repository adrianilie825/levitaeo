import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { revalidateCatalog } from "@/lib/admin/revalidate";
import { streamAdminStripeBulkSync } from "@/lib/admin/stripe-bulk-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Unauthorized.", code: "unauthorized" },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST() {
  const admin = await requireAdminApi();

  if (!admin) {
    return unauthorizedResponse();
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let shouldRevalidate = false;

      try {
        for await (const event of streamAdminStripeBulkSync()) {
          if (event.type === "item" && event.outcome !== "skipped") {
            shouldRevalidate = true;
          }

          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        }

        if (shouldRevalidate) {
          revalidateCatalog();
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Bulk Stripe sync failed unexpectedly.";

        controller.enqueue(
          encoder.encode(
            `${JSON.stringify({
              type: "error",
              message,
            })}\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/x-ndjson; charset=utf-8",
    },
  });
}
