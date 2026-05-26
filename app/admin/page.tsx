import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-black tracking-tight text-slate-900">
        Dashboard
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        This is the protected admin area (Auth.js credentials). The demo mockup
        is available as an embedded interactive page.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/demo"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow"
        >
          <div className="text-sm font-black text-slate-900">Portal demo</div>
          <div className="mt-1 text-sm text-slate-600">
            Open the interactive workflow demo in admin chrome.
          </div>
        </Link>
        <Link
          href="/demo"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow"
        >
          <div className="text-sm font-black text-slate-900">Public demo</div>
          <div className="mt-1 text-sm text-slate-600">
            Same demo, accessible without signing in.
          </div>
        </Link>
      </div>
    </div>
  );
}

