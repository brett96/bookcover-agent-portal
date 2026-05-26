import DemoFrame from "@/components/demo-frame";

export default function DemoPage() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <DemoFrame className="h-full min-h-0 flex-1 rounded-none border-0 shadow-none" />
    </div>
  );
}
