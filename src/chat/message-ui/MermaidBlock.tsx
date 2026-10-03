import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "../../button/Button";
import { CodeBlock } from "../../codeblock/CodeBlock";
import { SolarIcon } from "../../icon/SolarIcon";
import { cn } from "../../lib/cn";
import { sanitizeMermaid } from "./sanitizeMermaid";

export type MermaidBlockProps = {
  children: string;
  className?: string;
};

export function MermaidBlock({ children, className }: MermaidBlockProps) {
  const id = useId().replace(/:/g, "_");
  const containerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, startX: 0, startY: 0, panX: 0, panY: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      const { default: mermaid } = await import("mermaid");
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
      });

      const raw = children.trim();
      const renderId = `mermaid-${id}`;

      try {
        document.getElementById(`d${renderId}`)?.remove();
        const { svg } = await mermaid.render(renderId, raw);
        if (!cancelled) {
          setSvgContent(svg);
          setError(null);
        }
        return;
      } catch {
        document.getElementById(`d${renderId}`)?.remove();
      }

      const sanitized = sanitizeMermaid(raw);
      try {
        const sanitizedId = `${renderId}-s`;
        document.getElementById(sanitizedId)?.remove();
        document.getElementById(`d${sanitizedId}`)?.remove();
        const { svg } = await mermaid.render(sanitizedId, sanitized);
        if (!cancelled) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(String(err));
      }
    };

    void render();
    return () => {
      cancelled = true;
    };
  }, [children, id]);

  useEffect(() => {
    if (containerRef.current && svgContent) containerRef.current.innerHTML = svgContent;
  }, [svgContent]);

  useEffect(() => {
    if (dialogRef.current?.open && fullscreenRef.current && svgContent) {
      fullscreenRef.current.innerHTML = svgContent;
    }
  }, [svgContent]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const downloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const openFullscreen = () => {
    if (dialogRef.current && fullscreenRef.current) {
      fullscreenRef.current.innerHTML = svgContent;
      resetView();
      dialogRef.current.showModal();
    }
  };

  const closeFullscreen = () => {
    dialogRef.current?.close();
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setZoom((prev) => {
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      return Math.min(5, Math.max(0.3, prev * delta));
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, panX: 0, panY: 0 };
    setIsDragging(true);
    setPan((prev) => {
      dragRef.current.panX = prev.x;
      dragRef.current.panY = prev.y;
      return prev;
    });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const d = dragRef.current;
    if (!d.active) return;
    e.preventDefault();
    setPan({ x: d.panX + (e.clientX - d.startX), y: d.panY + (e.clientY - d.startY) });
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current.active = false;
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (dragRef.current.active) {
      dragRef.current.active = false;
      setIsDragging(false);
    }
  }, []);

  const isDefaultView = zoom === 1 && pan.x === 0 && pan.y === 0;

  if (error) {
    return (
      <div className={cn("my-3 rounded-lg bg-accent border border-destructive/30 p-4 text-xs text-destructive", className)}>
        <p className="font-medium mb-1">Mermaid render error</p>
        <pre className="whitespace-pre-wrap text-[11px] opacity-70">{error}</pre>
      </div>
    );
  }

  if (!svgContent) {
        return <CodeBlock code={children} language="mermaid" wordWrap className={cn("my-3 last:mb-0", className)} />;
  }

  return (
    <>
      <div className={cn("my-3 last:mb-0 group relative rounded-xl border border-border overflow-hidden bg-card", className)}>
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="small" icon={<SolarIcon name="maximize-linear" size={12} />} title="Fullscreen" aria-label="Fullscreen" onClick={openFullscreen} />
        </div>
        <div ref={containerRef} className="flex justify-center p-6 overflow-x-auto [&_svg]:max-w-full" />
      </div>

      <dialog
        ref={dialogRef}
        className="m-0 p-0 w-screen h-screen max-w-none max-h-none backdrop:bg-black/40 open:flex open:flex-col bg-card"
        onClose={resetView}
        onKeyDown={(e) => {
          if (e.key !== "Escape") return;
          e.preventDefault();
          e.stopPropagation();
          closeFullscreen();
        }}
      >
        <div className="fixed top-5 right-5 z-50 flex items-center gap-1.5">
          <Button size="small" icon={<SolarIcon name="download-linear" size={12} />} title="Download SVG" aria-label="Download SVG" onClick={downloadSvg} disabled={!svgContent} />
          <Button size="small" icon={<SolarIcon name="minimize-linear" size={12} />} title="Exit fullscreen" onClick={closeFullscreen}>
            Exit
          </Button>
        </div>

        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground shadow-md select-none bg-card">
          <span>{Math.round(zoom * 100)}%</span>
          {!isDefaultView ? (
            <Button type="text" size="small" onClick={resetView}>
              Reset
            </Button>
          ) : null}
        </div>

        <div
          role="application"
          aria-label="Pan and zoom diagram"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onDoubleClick={resetView}
          className={cn("flex-1 overflow-hidden w-full h-full select-none", isDragging ? "cursor-grabbing" : "cursor-grab")}
        >
          <div ref={fullscreenRef} className="flex items-center justify-center w-full h-full origin-center [&_svg]:max-w-none [&_svg]:max-h-none pointer-events-none" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }} />
        </div>
      </dialog>
    </>
  );
}
