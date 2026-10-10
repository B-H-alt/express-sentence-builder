import { useEffect } from "react";

type DeviceProfile = "phone" | "tablet" | "desktop";

const getDeviceProfile = (): DeviceProfile => {
  const width = window.innerWidth;

  if (width < 640) return "phone";
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

    const update = () => {
      root.dataset.device = getDeviceProfile();
      root.dataset.input = coarsePointer.matches ? "touch" : "pointer";
      root.dataset.orientation = window.innerWidth > window.innerHeight ? "landscape" : "portrait";
      root.classList.toggle("app-standalone", standalone.matches);
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    coarsePointer.addEventListener("change", update);
    standalone.addEventListener("change", update);

    return () => {
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
