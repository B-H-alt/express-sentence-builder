import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (!turnstileSiteKey || !containerRef.current) return;
    let widgetId: string | null = null;
    let cancelled = false;

    const render = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: turnstileSiteKey,
        theme: "auto",
        size: "flexible",
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
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
    <div className="rounded-xl border border-border bg-muted/25 p-2" aria-label="Security check">
      <div ref={containerRef} />
    </div>
  );
};
