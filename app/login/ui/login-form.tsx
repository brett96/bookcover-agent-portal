"use client";

import { signIn } from "next-auth/react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = useMemo(
    () => submitting || !email.trim() || !password,
    [email, password, submitting],
  );

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
          callbackUrl: "/admin",
        });

        if (res?.error) {
          setError("Invalid email or password.");
          setSubmitting(false);
          return;
        }

        router.push(res?.url ?? "/admin");
        setSubmitting(false);
      }}
    >
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-800">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-emerald-600/20 focus:ring-4"
          placeholder="admin@company.com"
          autoComplete="email"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-800">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none ring-emerald-600/20 focus:ring-4"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <button
        disabled={disabled}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-sm transition enabled:hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

