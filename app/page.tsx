import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50">
      <main className="w-full max-w-4xl px-6 py-20">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-10 shadow-sm backdrop-blur">
          <div className="text-[11px] font-extrabold tracking-[0.22em] text-emerald-700/80">
            BOOKCOVER · AGENT PORTAL
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">
            Agent Portal Demo (v57)
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            This site hosts the interactive agent portal mockup as a real Next.js
            app with a protected admin area, ready for Vercel deploy.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/demo"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
            >
              View demo (public)
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
            >
              Admin sign in
            </Link>
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="font-bold text-slate-900">Configure credentials</div>
            <div className="mt-1">
              Set <code className="font-mono">AUTH_SECRET</code>,{" "}
              <code className="font-mono">ADMIN_EMAIL</code>, and{" "}
              <code className="font-mono">ADMIN_PASSWORD</code> in Vercel
              environment variables.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
