import { clsx } from "clsx";

export default function DemoFrame({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      <iframe
        title="BookCover Agent Portal Demo"
        src="/agent-portal-demo.html"
        className="block h-full w-full border-0"
      />
    </div>
  );
}

