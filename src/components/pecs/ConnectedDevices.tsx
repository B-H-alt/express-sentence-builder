import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { currentRemoteSettings, deviceAction, deviceSchema, hashPairingCode, readLocalDevice, saveLocalDevice, DeviceLinkUnavailable, type CaregiverDevice, type RemoteSettings } from "@/lib/caregiverDevices";

export const ConnectedDevices = ({ onHome }: { onHome: () => void }) => {
  const [devices, setDevices] = useState<CaregiverDevice[]>([]);
  const [name, setName] = useState("Communication iPad");
  const [code, setCode] = useState("");
  const [pairCode, setPairCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [local, setLocal] = useState(readLocalDevice);
  const refresh = async () => {
    const { result, owner } = await deviceAction("list");
    if (readLocalDevice()?.owner !== owner) setLocal(null);
    if (!Array.isArray(result)) throw new Error("Could not read linked devices.");
    setDevices(result.map(device => deviceSchema.parse(device)));
  };
  const run = async (work: () => Promise<void>) => {
    setBusy(true); setMessage("");
    try { await work(); } catch (error) { setMessage(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  };
  useEffect(() => { void run(refresh); }, []);
  const remember = (value: typeof local) => { saveLocalDevice(value); setLocal(value); };
  return <section>
    <div className="mb-6 flex items-center gap-3"><Button variant="outline" onClick={onHome}>Back</Button><h2 className="text-xl font-semibold">Connected devices</h2></div>
    <p className="mb-6 text-sm text-muted-foreground">Use the same verified caregiver account on both devices. Internet is required.</p>
    {message && <p role="status" className="mb-5 rounded-xl border border-border bg-card p-4 text-sm">{message}</p>}
    <div className="grid gap-5 sm:grid-cols-2">
      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold">On the communication device</h3>
        <p className="mt-2 text-sm text-muted-foreground">Create a code here, then enter it on your phone.</p>
        {!local ? <form className="mt-4 space-y-4" onSubmit={event => { event.preventDefault(); void run(async () => {
          const raw = Array.from(crypto.getRandomValues(new Uint8Array(16)), v => v.toString(16).padStart(2,"0")).join("");
          const { result, owner } = await deviceAction("register", { name: name.trim(), code_hash: await hashPairingCode(raw), settings: currentRemoteSettings() });
          const device = deviceSchema.parse(result);
          try { remember({ id: device.id, owner, revision: device.revision }); }
          catch { await deviceAction("revoke", { id: device.id }); throw new Error("This browser could not save the device link."); }
          setCode(raw.match(/.{4}/g)!.join("-"));
        }); }}>
          <label className="block text-sm">Device name<input value={name} onChange={event => setName(event.target.value)} maxLength={50} required className="mt-2 w-full rounded-xl border border-border bg-background p-3" /></label>
          <Button disabled={busy || !name.trim()} type="submit">Create pairing code</Button>
        </form> : <div className="mt-4 space-y-3">
          {code ? <><p className="break-all rounded-xl bg-muted p-3 font-mono text-sm select-all">{code}</p><Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(code); setMessage("Pairing code copied."); } catch { setMessage("Select the code above to copy it."); } }}>Copy code</Button><p className="text-xs text-muted-foreground">One use. Expires in 10 minutes. Share only with your caregiver.</p></> : <p className="text-sm text-muted-foreground">This device is registered. Pending codes expire after 10 minutes.</p>}
          <Button variant="outline" disabled={busy} onClick={() => { if (confirmRemove !== local.id) { setConfirmRemove(local.id); return; } void run(async () => { try { await deviceAction("revoke", { id: local.id }); } catch (error) { if (!(error instanceof DeviceLinkUnavailable)) throw error; } remember(null); setCode(""); setConfirmRemove(null); await refresh(); }); }}>{confirmRemove === local.id ? "Confirm unlink this device" : "Unlink this device"}</Button>
        </div>}
      </section>
      <section className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold">On your phone</h3>
        <form className="mt-4 space-y-4" onSubmit={event => { event.preventDefault(); void run(async () => {
          await deviceAction("pair", { code_hash: await hashPairingCode(pairCode) }); setPairCode(""); await refresh(); setMessage("Device connected. Choose its settings below.");
        }); }}>
          <label className="block text-sm">Pairing code<input autoComplete="off" autoCapitalize="none" spellCheck={false} value={pairCode} onChange={event => setPairCode(event.target.value)} maxLength={64} required className="mt-2 w-full rounded-xl border border-border bg-background p-3 font-mono" /></label>
          <Button type="submit" disabled={busy || !pairCode.trim()}>Connect device</Button>
        </form>
      </section>
    </div>
    <div className="mb-4 mt-8 flex items-center justify-between"><h3 className="font-semibold">Linked devices</h3><Button variant="outline" disabled={busy} onClick={() => void run(refresh)}>Refresh</Button></div>
    <p className="mb-4 text-sm text-muted-foreground">Changes apply while the board is open, after the current sentence is cleared. Playing speech keeps its original volume.</p>
    <div className="space-y-4">{devices.filter(device => device.id !== local?.id).map(device => <DeviceSettings key={`${device.id}:${device.revision}`} device={device} busy={busy} onSave={settings => void run(async () => { await deviceAction("update", { id: device.id, revision: device.revision, settings }); await refresh(); setMessage("Settings saved for the device. Delivery is not yet confirmed."); })} onRemove={() => { if (confirmRemove !== device.id) { setConfirmRemove(device.id); return; } void run(async () => { await deviceAction("revoke", { id: device.id }); setConfirmRemove(null); await refresh(); }); }} confirming={confirmRemove === device.id} />)}</div>
    {!devices.filter(device => device.id !== local?.id).length && <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">No other linked devices.</p>}
  </section>;
};

const DeviceSettings = ({ device, busy, onSave, onRemove, confirming }: { device: CaregiverDevice; busy: boolean; onSave: (settings: RemoteSettings) => void; onRemove: () => void; confirming: boolean }) => {
  const [settings, setSettings] = useState(device.settings);
  return <form className="space-y-5 rounded-2xl border border-border bg-card p-5" onSubmit={event => { event.preventDefault(); onSave(settings); }}>
    <h4 className="font-semibold">{device.name}</h4>
    <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={settings.calm} onChange={event => setSettings({ ...settings, calm: event.target.checked })} className="h-5 w-5" />Calm mode</label>
    <label className="block text-sm">Volume: {Math.round(settings.volume * 100)}%<input aria-label={`${device.name} volume`} type="range" min="0.1" max="1" step="0.1" value={settings.volume} onChange={event => setSettings({ ...settings, volume: Number(event.target.value) })} className="mt-2 h-11 w-full" /></label>
    <label className="block text-sm">Vocabulary level<select value={settings.level} onChange={event => setSettings({ ...settings, level: Number(event.target.value) as RemoteSettings["level"] })} className="ml-3 rounded-lg border border-border bg-background p-2">{[1,2,3,4,5].map(level => <option key={level} value={level}>Level {level}</option>)}</select></label>
    <div className="flex flex-wrap gap-3"><Button type="submit" disabled={busy || JSON.stringify(settings) === JSON.stringify(device.settings)}>Save settings</Button><Button type="button" variant="outline" disabled={busy} onClick={onRemove}>{confirming ? "Confirm unlink" : "Unlink"}</Button></div>
  </form>;
};
