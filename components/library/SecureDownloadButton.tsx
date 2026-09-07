"use client";

import { useState } from "react";

type SecureDownloadButtonProps = {
  productId: string | null;
  isDownloadReady: boolean;
  variantKey?: string | null;
  label?: string;
  compact?: boolean;
};

type ButtonState = "idle" | "loading" | "error";

export default function SecureDownloadButton({
  productId,
  isDownloadReady,
  variantKey = null,
  label,
  compact = false,
}: SecureDownloadButtonProps) {
  const [state, setState] = useState<ButtonState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isDisabled = !isDownloadReady || !productId || state === "loading";

  async function requestSignedUrl(): Promise<{
    url: string;
    filename: string;
  }> {
    if (!productId) {
      throw new Error("Download is not available.");
    }

    const response = await fetch(`/api/downloads/${productId}`, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(variantKey ? { "Content-Type": "application/json" } : {}),
      },
      body: variantKey ? JSON.stringify({ variantKey }) : undefined,
    });

    const payload = (await response.json()) as {
      url?: string;
      filename?: string;
      error?: string;
      retryAfterMs?: number;
    };

    if (!response.ok || !payload.url) {
      throw new Error(payload.error ?? "Download is not available.");
    }

    return {
      url: payload.url,
      filename: payload.filename ?? "levitaeo-edition",
    };
  }

  async function triggerDownload(signedUrl: string, downloadFilename: string) {
    const anchor = document.createElement("a");
    anchor.href = signedUrl;
    anchor.download = downloadFilename;
    anchor.rel = "noopener noreferrer";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  async function handleClick() {
    if (isDisabled) {
      return;
    }

    setState("loading");
    setErrorMessage(null);

    try {
      const firstAttempt = await requestSignedUrl();
      await triggerDownload(firstAttempt.url, firstAttempt.filename);
      setState("idle");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Download could not be started. Please try again.";

      if (message.includes("not available") || message.includes("Too many")) {
        setErrorMessage(message);
        setState("error");
        return;
      }

      try {
        const retryAttempt = await requestSignedUrl();
        await triggerDownload(retryAttempt.url, retryAttempt.filename);
        setState("idle");
      } catch (retryError) {
        setErrorMessage(
          retryError instanceof Error
            ? retryError.message
            : "Download could not be started. Please try again.",
        );
        setState("error");
      }
    }
  }

  let buttonLabel = "Download unavailable";

  if (isDownloadReady && productId) {
    if (state === "loading") {
      buttonLabel = "Preparing…";
    } else if (label) {
      buttonLabel = label;
    } else {
      buttonLabel = "Download";
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        aria-busy={state === "loading"}
        aria-disabled={isDisabled}
        aria-label={
          isDownloadReady && productId
            ? label
              ? `Download ${label}`
              : "Download your purchased edition"
            : "Download unavailable"
        }
        className={
          compact
            ? "inline-flex w-full items-center justify-between border border-[#ECE8E2] px-4 py-2.5 text-left text-[12px] tracking-[0.06em] text-[#111111] transition-colors hover:border-[#111111] disabled:cursor-not-allowed disabled:opacity-80"
            : "inline-flex w-full items-center justify-center border border-[#ECE8E2] px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-neutral-500 transition-colors hover:border-[#111111] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-80"
        }
      >
        <span>{buttonLabel}</span>
        {compact && isDownloadReady && productId && state !== "loading" ? (
          <span className="text-[10px] uppercase tracking-[0.14em] text-neutral-400">
            Download
          </span>
        ) : null}
      </button>

      {state === "error" && errorMessage ? (
        <p
          className={`${compact ? "mt-2" : "mt-3"} text-[13px] leading-6 text-neutral-600`}
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
