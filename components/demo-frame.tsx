export default function DemoFrame() {
  return (
    <div className="h-full min-h-[760px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <iframe
        title="BookCover Agent Portal Demo"
        src="/agent-portal-demo.html"
        className="h-full w-full"
      />
    </div>
  );
}

