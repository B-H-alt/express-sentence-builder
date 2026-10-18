import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCardStore } from "@/store/cardStore";
import { speakDeviceText, stopDeviceSpeech } from "@/utils/device-speech";

export const DeviceVoiceTest = () => {
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => () => stopDeviceSpeech(), []);
  const test = async () => {
    const { language, speechRate, speechVolume } = useCardStore.getState();
    setTesting(true); setMessage("");
    try {
      await speakDeviceText(language === "es" ? "Esta es mi voz." : "This is my voice.", language, speechRate, speechVolume);
      setMessage("Test finished. If you heard nothing, check device volume, silent mode and Bluetooth output.");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setMessage(error instanceof Error ? error.message : "Device voice could not play.");
    } finally { setTesting(false); }
  };
  return <div className="space-y-2">
    <Button type="button" variant="outline" onClick={testing ? stopDeviceSpeech : () => void test()}>{testing ? "Stop voice test" : "Test device voice"}</Button>
    <p className="text-xs text-muted-foreground">Plays a short sentence aloud.</p>
    {message && <p role="status" className="text-sm">{message}</p>}
  </div>;
};
