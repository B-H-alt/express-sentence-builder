import { z } from "zod";
import { getSupabase } from "./supabase";
import { useCardStore } from "@/store/cardStore";

export const remoteSettingsSchema = z.object({ calm: z.boolean(), volume: z.number().min(0.1).max(1), level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]) }).strict();
export type RemoteSettings = z.infer<typeof remoteSettingsSchema>;
export const deviceSchema = z.object({ id: z.string().uuid(), name: z.string().max(50), settings: remoteSettingsSchema, revision: z.number().int().nonnegative(), paired: z.boolean().optional(), updated_at: z.string() });
export type CaregiverDevice = z.infer<typeof deviceSchema>;
const LOCAL_KEY = "expressly-linked-device-v1";
export type LocalDevice = { id: string; owner: string; revision: number };
export class DeviceLinkUnavailable extends Error {}
export const readLocalDevice = (): LocalDevice | null => {
  try { return z.object({ id: z.string().uuid(), owner: z.string().uuid(), revision: z.number().int().nonnegative() }).parse(JSON.parse(localStorage.getItem(LOCAL_KEY) || "null")) as LocalDevice; } catch { return null; }
};
export const saveLocalDevice = (device: LocalDevice | null) => {
  if (device) localStorage.setItem(LOCAL_KEY, JSON.stringify(device)); else localStorage.removeItem(LOCAL_KEY);
  window.dispatchEvent(new Event("expressly-device-link-changed"));
};
export const hashPairingCode = async (code: string) => {
  const normalized = code.replace(/[\s-]/g, "").toLowerCase();
  if (!/^[a-f0-9]{32}$/.test(normalized)) throw new Error("Enter the complete pairing code.");
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized)));
  return Array.from(bytes, value => value.toString(16).padStart(2,"0")).join("");
};
export const deviceAction = async (action: string, data: Record<string, unknown> = {}) => {
  const client = await getSupabase();
  if (!client) throw new Error("Cloud accounts are not configured.");
  // Local session is only a UI check. The RPC verifies JWT identity and confirmed email.
  const { data: auth, error: authError } = await client.auth.getSession();
  const user = auth.session?.user;
  if (authError || !user?.email_confirmed_at) throw new Error("Sign in with a verified caregiver account first.");
  const { data: result, error } = await client.rpc("caregiver_device_action", { p_action: action, p_data: data });
  if (error) {
    if (error.message === "Device unavailable") throw new DeviceLinkUnavailable("This device is no longer linked.");
    if (error.code === "PGRST202" || error.code === "42883") throw new Error("Device linking is not enabled on the server yet.");
    throw new Error("Device request failed. Refresh and try again, or check that the code has not expired.");
  }
  return { result, owner: user.id };
};
export const currentRemoteSettings = (): RemoteSettings => {
  const state = useCardStore.getState();
  return { calm: state.lowStimulationMode, volume: Math.max(0.1, state.speechVolume), level: state.currentLevel };
};
// One atomic, allowlisted update. Never touch sentence, identity, PIN, cards or audio.
export const applyRemoteSettings = (input: unknown) => {
  const settings = remoteSettingsSchema.parse(input);
  if (useCardStore.getState().sentence.length) return false;
  useCardStore.setState({ lowStimulationMode: settings.calm, speechVolume: settings.volume, currentLevel: settings.level });
  return true;
};
