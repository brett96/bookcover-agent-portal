import DemoFrame from "@/components/demo-frame";

export default function AdminDemoPage() {
  return (
    <div className="flex h-[calc(100vh-0px)] flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="text-sm font-black text-slate-900">
          Agent Portal Demo
        </div>
        <div className="mt-1 text-sm text-slate-600">
          Embedded mockup: <code className="font-mono">BookCover_Admin_Demo_v57.html</code>
        </div>
      </div>
      <div className="flex-1 p-4">
        <DemoFrame />
      </div>
    </div>
  );
}

