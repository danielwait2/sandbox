"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Runway</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Turn receipt emails into clear budget categories.
        </p>
        <button
          className="mt-6 w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          type="button"
        >
          Sign in with Google
        </button>
      </section>
    </main>
  );
}
