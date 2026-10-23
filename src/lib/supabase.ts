import { clearPrivateSession } from "./privateSession";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const isCloudAccountConfigured = Boolean(
  supabaseUrl && supabasePublishableKey,
);

let clientPromise: Promise<SupabaseClient | null> | null = null;

export type SocialProvider = "google" | "apple";

// Public Auth settings prevent sending users to a disabled provider's error page.
export const isSocialProviderEnabled = async (provider: SocialProvider) => {
  if (!isCloudAccountConfigured) return false;
  const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
    headers: { apikey: supabasePublishableKey! },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Unable to check sign-in availability");
  const settings: { external?: Partial<Record<SocialProvider, boolean>> } = await response.json();
  return settings.external?.[provider] === true;
};

export const getSupabase = async () => {
  if (!isCloudAccountConfigured) return null;
  if (!clientPromise) {
    clientPromise = import("@supabase/supabase-js").then(({ createClient }) => {
      const client = createClient(supabaseUrl!, supabasePublishableKey!, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      let accountId: string | null | undefined;
      client.auth.onAuthStateChange((event, session) => {
        const nextAccount = session?.user.id ?? null;
        if (event === "SIGNED_OUT" || (accountId !== undefined && accountId !== nextAccount)) clearPrivateSession();
        accountId = nextAccount;
      });
      return client;
    });
  }
  return clientPromise;
};

export const getAccessToken = async () => {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.access_token ?? null;
};
