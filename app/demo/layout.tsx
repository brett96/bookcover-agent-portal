import Script from "next/script";
import type { ReactNode } from "react";

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-dvh overflow-hidden">
      <Script
        src="/analytics.js"
        strategy="afterInteractive"
        data-product="agent-demo"
        data-site="agent"
        data-track-url="/api/track"
      />
      {children}
    </div>
  );
}
