import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="flex min-h-[100dvh] items-center justify-center bg-background px-6 py-12 text-center">
      <div className="max-w-sm"><p className="text-lg font-semibold text-primary">Expressly</p><h1 className="mt-5 text-2xl font-semibold">Let’s try opening that again.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">A page could not load. Check your connection and retry. Retrying does not clear your saved cards or settings.</p><Button className="mt-6" onClick={() => window.location.reload()}>Retry opening Expressly</Button><p className="mt-4 text-sm"><a href="/pecs-app" className="text-primary underline underline-offset-4">Open communication board</a></p></div>
    </main>;
  }
}
