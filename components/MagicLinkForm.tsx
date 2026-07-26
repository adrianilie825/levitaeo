"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/site";

type MagicLinkFormProps = {
  nextPath: string;
};

type FormState = "idle" | "submitting" | "success" | "error";

export default function MagicLinkForm({ nextPath }: MagicLinkFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      return;
    }

    setState("submitting");

    try {
      const supabase = createClient();
      const redirectTo = `${siteConfig.url}/auth/callback?next=${encodeURIComponent(nextPath)}`;

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      });

      if (error) {
        setState("error");
        return;
      }

      setState("success");
    } catch {
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
        <p className="mt-4 text-[13px] leading-6 text-neutral-600" role="alert">
          We could not send the sign-in link. Please try again.
        </p>
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
