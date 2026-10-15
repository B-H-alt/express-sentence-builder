import { useEffect } from "react";

type DeviceProfile = "phone" | "tablet" | "desktop";

const getDeviceProfile = (hasCoarsePointer: boolean): DeviceProfile => {
  const width = window.innerWidth;

  if (width < 640) return "phone";
  // Large iPads can be wider than desktop breakpoints in landscape. Input
  // method keeps them on the touch-first tablet layout after rotation.
  if (hasCoarsePointer && width < 1400) return "tablet";
  if (width < 1024) return "tablet";
  return "desktop";
};

/**
 * Keeps lightweight device information on the root element so the interface
 * can respond to the available space and input method without depending on a
 * fragile browser or device-name check.
 */
export const useDeviceProfile = () => {
  useEffect(() => {
    const root = document.documentElement;
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const standalone = window.matchMedia("(display-mode: standalone)");
    const viewport = window.visualViewport;
    let focusTimer: ReturnType<typeof setTimeout>;
    const updateViewport = () => {
      const height = viewport?.height ?? window.innerHeight;
      root.style.setProperty("--visual-height", `${height}px`);
      root.style.setProperty("--visual-top", `${viewport?.offsetTop ?? 0}px`);
      const editing = document.activeElement?.matches("input, textarea, [contenteditable='true']");
      root.dataset.keyboard = editing && window.innerHeight - height > 150 ? "open" : "closed";
    };
    const revealInput = () => {
      updateViewport();
      clearTimeout(focusTimer);
      focusTimer = setTimeout(() => {
        const input = document.activeElement;
        if (input instanceof HTMLElement && input.matches("input, textarea")) {
          input.scrollIntoView({ block: "nearest", behavior: "auto" });
        }
      }, 250);
    };

    const update = () => {
      root.dataset.device = getDeviceProfile(coarsePointer.matches);
      root.dataset.input = coarsePointer.matches ? "touch" : "pointer";
      root.dataset.orientation = window.innerWidth > window.innerHeight ? "landscape" : "portrait";
      root.classList.toggle("app-standalone", standalone.matches);
    };

    update();
    updateViewport();
    viewport?.addEventListener("resize", revealInput);
    viewport?.addEventListener("scroll", updateViewport);
    document.addEventListener("focusin", revealInput);
    document.addEventListener("focusout", updateViewport);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    coarsePointer.addEventListener("change", update);
    standalone.addEventListener("change", update);

    return () => {
      clearTimeout(focusTimer);
      viewport?.removeEventListener("resize", revealInput);
      viewport?.removeEventListener("scroll", updateViewport);
      document.removeEventListener("focusin", revealInput);
      document.removeEventListener("focusout", updateViewport);
      root.style.removeProperty("--visual-height");
      root.style.removeProperty("--visual-top");
      delete root.dataset.keyboard;
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      coarsePointer.removeEventListener("change", update);
      standalone.removeEventListener("change", update);
      delete root.dataset.device;
      delete root.dataset.input;
      delete root.dataset.orientation;
      root.classList.remove("app-standalone");
    };
  }, []);
};
