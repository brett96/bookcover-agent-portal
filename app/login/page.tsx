import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginForm from "./ui/login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/85 p-8 shadow-sm backdrop-blur">
        <div className="text-[11px] font-extrabold tracking-[0.22em] text-emerald-700/80">
          BOOKCOVER · ADMIN
        </div>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Use the credentials set via environment variables.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

