"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  buildAuthCallbackUrl,
  setAuthNextCookie,
} from "@/lib/auth/next-path";

type MagicLinkFormProps = {
  nextPath: string;
};

type FormState = "idle" | "submitting" | "success" | "error";

type AuthErrorDetails = {
  message: string;
  status?: number;
  code?: string;
};

const isDevelopment = process.env.NODE_ENV === "development";

function toAuthErrorDetails(error: unknown): AuthErrorDetails {
  if (error && typeof error === "object" && "message" in error) {
    const authError = error as {
      message: string;
      status?: number;
      code?: string;
    };

    return {
      message: authError.message,
      status: authError.status,
      code: authError.code,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "Unknown authentication error." };
}

export default function MagicLinkForm({ nextPath }: MagicLinkFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [authError, setAuthError] = useState<AuthErrorDetails | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return;
    }

    setState("submitting");
    setAuthError(null);

    try {
      const supabase = createClient();
      setAuthNextCookie(nextPath);
      const redirectTo = buildAuthCallbackUrl(window.location.origin);

      if (isDevelopment) {
        console.log("[MagicLinkForm] signInWithOtp request:", {
          origin: window.location.origin,
          nextPath,
          emailRedirectTo: redirectTo,
        });
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      });

      if (error) {
        const details = toAuthErrorDetails(error);

        if (isDevelopment) {
          console.error("[MagicLinkForm] signInWithOtp failed:", {
            message: details.message,
            status: details.status,
            code: details.code,
            redirectTo,
            nextPath,
          });
        }

        setAuthError(details);
        setState("error");
        return;
      }

      setState("success");
    } catch (error) {
      const details = toAuthErrorDetails(error);

      if (isDevelopment) {
        console.error("[MagicLinkForm] signInWithOtp threw:", {
          message: details.message,
          status: details.status,
          code: details.code,
          nextPath,
        });
      }

      setAuthError(details);
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="mt-10 max-w-md">
        <h2 className="text-xl font-light tracking-[-0.02em] text-[#111111]">
          Check your inbox
        </h2>
        <p className="mt-4 text-[15px] leading-7 text-neutral-600">
          We sent a secure Levitaeo sign-in link to your email address.
        </p>
      </div>
    );
  }

  return (
    <form className="mt-10 max-w-md" onSubmit={handleSubmit} noValidate>
      <label
        htmlFor="email"
        className="block text-[11px] uppercase tracking-[0.28em] text-neutral-500"
      >
        Email address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={state === "submitting"}
        aria-busy={state === "submitting"}
        className="mt-3 w-full border border-[#ECE8E2] bg-white px-4 py-3.5 text-[15px] text-[#111111] outline-none transition-colors focus-visible:border-[#111111]"
      />

      {state === "error" ? (
        <div className="mt-4 space-y-2" role="alert">
          <p className="text-[13px] leading-6 text-neutral-600">
            We could not send the sign-in link. Please try again.
          </p>
          {isDevelopment && authError ? (
            <p className="rounded border border-[#ECE8E2] bg-[#F7F5F1] px-3 py-2 font-mono text-[12px] leading-6 text-neutral-700">
              {authError.message}
              {authError.code ? ` (code: ${authError.code})` : ""}
              {authError.status ? ` (status: ${authError.status})` : ""}
            </p>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={state === "submitting"}
        aria-busy={state === "submitting"}
        className="mt-6 inline-flex items-center justify-center border border-[#111111] bg-[#111111] px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-transparent hover:text-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "submitting" ? "Sending…" : "Send Magic Link"}
      </button>
    </form>
  );
}
