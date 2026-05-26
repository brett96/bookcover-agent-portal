import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import SignOutButton from "./ui/signout-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50">
      <aside className="w-72 border-r border-slate-200 bg-white">
        <div className="p-5">
          <div className="text-[10px] font-extrabold tracking-[0.22em] text-emerald-700/80">
            BOOKCOVER · ADMIN
          </div>
          <div className="mt-2 text-lg font-black tracking-tight text-slate-900">
            Agent Portal
          </div>
          <div className="mt-1 text-xs text-slate-600">
            Signed in as{" "}
            <span className="font-bold text-slate-800">
              {session.user.email}
            </span>
          </div>
        </div>
        <nav className="px-3 pb-5">
          <Link
            href="/admin"
            className="block rounded-xl px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/demo"
            className="mt-1 block rounded-xl px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100"
          >
            Portal demo
          </Link>
          <Link
            href="/demo"
            className="mt-1 block rounded-xl px-3 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100"
          >
            Public demo
          </Link>
          <div className="mt-4 px-3">
            <SignOutButton />
          </div>
        </nav>
      </aside>
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}

