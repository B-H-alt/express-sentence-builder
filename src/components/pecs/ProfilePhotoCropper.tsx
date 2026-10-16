import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const clamp = (value: number) => Math.max(-1, Math.min(1, value));

export const ProfilePhotoCropper = ({ source, onApply, onCancel }: {
  source: string;
  onApply: (image: string) => void;
  onCancel: () => void;
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [size, setSize] = useState(280);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const frame = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; startX: number; startY: number } | null>(null);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new ResizeObserver(() => setSize(element.clientWidth));
    observer.observe(element);
    element.closest("section")?.scrollIntoView({ block: "start", behavior: "instant" });
    return () => observer.disconnect();
  }, []);

  const scale = dimensions.width ? Math.max(size / dimensions.width, size / dimensions.height) * zoom : 1;
  const width = dimensions.width * scale;
  const height = dimensions.height * scale;
  const maxX = Math.max(0, (width - size) / 2);
  const maxY = Math.max(0, (height - size) / 2);

  const apply = () => {
    if (!image.current || !dimensions.width) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 512;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("Crop unavailable");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, 512, 512);
      const side = size / scale;
      const x = Math.max(0, Math.min(dimensions.width - side, (dimensions.width - side) / 2 - position.x * maxX / scale));
      const y = Math.max(0, Math.min(dimensions.height - side, (dimensions.height - side) / 2 - position.y * maxY / scale));
      context.drawImage(image.current, x, y, side, side, 0, 0, 512, 512);
      onApply(canvas.toDataURL("image/jpeg", 0.88));
    } catch {
      setError("That photo could not be cropped. Try uploading it again.");
    }
  };

  return (
    <section className="space-y-4 rounded-xl border border-border bg-background p-4" aria-labelledby="crop-photo-title">
      <div>
        <h3 id="crop-photo-title" className="text-sm font-semibold">Adjust your photo</h3>
        <p id="crop-photo-help" className="mt-1 text-xs text-muted-foreground">Drag and zoom to fit the circle.</p>
      </div>
      <div ref={frame} tabIndex={0} role="group" aria-label="Photo position" aria-describedby="crop-photo-help crop-photo-keyboard"
        className="relative mx-auto aspect-square w-full max-w-[280px] touch-none overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onPointerDown={(event) => {
          if (!dimensions.width) return;
          event.currentTarget.focus();
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, startX: position.x, startY: position.y };
        }}
        onPointerMove={(event) => {
          const start = drag.current;
          if (!start || start.id !== event.pointerId) return;
          setPosition({ x: maxX ? clamp(start.startX + (event.clientX - start.x) / maxX) : 0, y: maxY ? clamp(start.startY + (event.clientY - start.y) / maxY) : 0 });
        }}
        onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
        onLostPointerCapture={() => { drag.current = null; }}
        onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
          event.preventDefault();
          const step = event.shiftKey ? 0.2 : 0.05;
          setPosition((previous) => ({ x: clamp(previous.x + (event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0)), y: clamp(previous.y + (event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0)) }));
        }}>
        <img ref={image} src={source} alt="Photo being cropped" draggable={false}
          onLoad={(event) => setDimensions({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
          onError={() => setError("That photo could not be opened. Try uploading it again.")}
          className="pointer-events-none absolute max-w-none select-none"
          style={{ width: dimensions.width ? width : "100%", height: dimensions.height ? height : "100%", left: (size - width) / 2 + position.x * maxX, top: (size - height) / 2 + position.y * maxY }} />
        <svg aria-hidden="true" viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full">
          <path d="M0 0H100V100H0Z M100 50A50 50 0 1 0 0 50A50 50 0 1 0 100 50Z" fill="black" fillOpacity="0.45" fillRule="evenodd" />
          <circle cx="50" cy="50" r="49.5" fill="none" stroke="white" strokeWidth="0.7" />
        </svg>
      </div>
      <p id="crop-photo-keyboard" className="text-xs text-muted-foreground">Arrow keys also move the photo.</p>
      <label className="block space-y-2 text-sm">
        <span className="flex justify-between"><span>Zoom</span><span className="text-muted-foreground">{Math.round(zoom * 100)}%</span></span>
        <input aria-label="Photo zoom" type="range" min="1" max="3" step="0.01" value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))} className="profile-photo-zoom h-11 w-full accent-primary" />
      </label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); }}>Reset position</Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel crop</Button>
          <Button type="button" size="sm" disabled={!dimensions.width || Boolean(error)} onClick={apply}>Use photo</Button>
        </div>
      </div>
    </section>
  );
};
