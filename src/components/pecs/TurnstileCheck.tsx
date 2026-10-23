import { useEffect, useRef, useState } from "react";
import { turnstileSiteKey } from "@/lib/captcha";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const scriptId = "expressly-turnstile-script";

interface TurnstileCheckProps {
  onToken: (token: string) => void;
  resetKey: number;
}

export const TurnstileCheck = ({ onToken, resetKey }: TurnstileCheckProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"checking" | "verified" | "interaction" | "error">("checking");

  useEffect(() => {
    if (!turnstileSiteKey || !containerRef.current) return;
    setStatus("checking");
    let widgetId: string | null = null;
    let cancelled = false;

    const render = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: turnstileSiteKey,
        theme: "auto",
        size: "flexible",
        appearance: "interaction-only",
        callback: (token: string) => { setStatus("verified"); onToken(token); },
        "before-interactive-callback": () => setStatus("interaction"),
        "expired-callback": () => { setStatus("checking"); onToken(""); },
        "error-callback": () => { setStatus("error"); onToken(""); },
      });
    };

    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (window.turnstile) {
      render();
    } else if (existing) {
      existing.addEventListener("load", render, { once: true });
    } else {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", render, { once: true });
      script.addEventListener("error", () => { if (!cancelled) setStatus("error"); }, { once: true });
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      existing?.removeEventListener("load", render);
    };
  }, [onToken, resetKey]);

  if (!turnstileSiteKey) return null;

  return (
    <div aria-label="Security check">
      {status === "checking" && <p role="status" className="text-sm text-foreground/80">Checking security…</p>}
      {status === "interaction" && <p className="mb-2 text-sm text-foreground/80">Complete this quick security check to continue.</p>}
      {status === "error" && <p role="status" className="text-sm text-destructive">The security check could not load. Please reload and try again.</p>}
      <div ref={containerRef} />
    </div>
  );
};
