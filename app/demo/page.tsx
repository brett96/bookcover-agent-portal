import DemoFrame from "@/components/demo-frame";
import Link from "next/link";

export default function DemoPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-black tracking-tight text-slate-900">
            BookCover
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 p-4">
        <DemoFrame />
      </div>
    </div>
  );
}

