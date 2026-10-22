import { clearPrivateSession } from "./privateSession";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const isCloudAccountConfigured = Boolean(
  supabaseUrl && supabasePublishableKey,
);

let clientPromise: Promise<SupabaseClient | null> | null = null;

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
