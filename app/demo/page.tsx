import DemoFrame from "@/components/demo-frame";
import TrackPageView from "@/components/track-pageview";

export default function DemoPage() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <TrackPageView properties={{ surface: "public-demo" }} />
      <DemoFrame className="h-full min-h-0 flex-1 rounded-none border-0 shadow-none" />
    </div>
  );
}
