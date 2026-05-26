import DemoFrame from "@/components/demo-frame";
import TrackPageView from "@/components/track-pageview";

export default function AdminDemoPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <TrackPageView properties={{ surface: "admin-demo" }} />
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="text-sm font-black text-slate-900">
          Agent Portal Demo
        </div>
        <div className="mt-1 text-sm text-slate-600">
          Embedded mockup: <code className="font-mono">BookCover_Admin_Demo_v57.html</code>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <DemoFrame className="min-h-0 flex-1" />
      </div>
    </div>
  );
}

