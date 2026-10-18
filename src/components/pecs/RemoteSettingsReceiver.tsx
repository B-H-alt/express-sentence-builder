import { useEffect } from "react";
import { applyRemoteSettings, deviceAction, deviceSchema, readLocalDevice, saveLocalDevice, DeviceLinkUnavailable } from "@/lib/caregiverDevices";

export const RemoteSettingsReceiver = () => {
  useEffect(() => {
    let stopped = false;
    let generation = 0;
    let timer: ReturnType<typeof setTimeout>;
    let delay = 15_000;
    const schedule = () => { clearTimeout(timer); if (!stopped) timer = setTimeout(poll, delay); };
    const poll = async () => {
      const local = readLocalDevice();
      if (!local || stopped) return;
      const requestGeneration = generation;
      if (document.hidden || !navigator.onLine) { schedule(); return; }
      try {
        const { result, owner } = await deviceAction("poll", { id: local.id });
        const current = readLocalDevice();
        if (stopped || requestGeneration !== generation || current?.id !== local.id || owner !== local.owner) return;
        const device = deviceSchema.parse(result);
        if (device.id !== local.id) return;
        if (device.paired && device.revision > local.revision && applyRemoteSettings(device.settings)) {
          // These preferences are already persisted by the store before acknowledgment.
          saveLocalDevice({ ...local, revision: device.revision });
        }
        delay = 15_000;
      } catch (error) {
        if (!stopped && requestGeneration === generation && error instanceof DeviceLinkUnavailable && readLocalDevice()?.id === local.id) { saveLocalDevice(null); return; }
        delay = Math.min(delay * 2, 120_000);
      }
      schedule();
    };
    const restart = () => { generation += 1; delay = 15_000; clearTimeout(timer); timer = setTimeout(poll, 250); };
    window.addEventListener("expressly-device-link-changed", restart);
    window.addEventListener("expressly-pin-changed", restart);
    window.addEventListener("storage", restart);
    window.addEventListener("online", restart);
    document.addEventListener("visibilitychange", restart);
    void poll();
    return () => {
      stopped = true; clearTimeout(timer);
      window.removeEventListener("expressly-device-link-changed", restart);
      window.removeEventListener("expressly-pin-changed", restart);
      window.removeEventListener("storage", restart);
      window.removeEventListener("online", restart);
      document.removeEventListener("visibilitychange", restart);
    };
  }, []);
  return null;
};
