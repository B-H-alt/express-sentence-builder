import { createClient } from "@supabase/supabase-js";
import { handleNativeCors, rejectUnlessPost, setPrivateApiHeaders } from "../_security.js";

interface ApiRequest {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: (body?: unknown) => void;
}

export const config = {
  api: { bodyParser: { sizeLimit: "2kb" } },
};

const getHeader = (req: ApiRequest, name: string) => {
  const value = req.headers[name] ?? req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setPrivateApiHeaders(res);
  if (handleNativeCors(req, res)) return;
  if (rejectUnlessPost(req, res)) return;

  const confirmation = (req.body as { confirmation?: unknown } | null)?.confirmation;
  if (confirmation !== "DELETE") {
    res.status(400).json({ ok: false, error: "Deletion was not confirmed." });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const authorization = getHeader(req, "authorization")?.trim();
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";

  if (!supabaseUrl || !publishableKey || !serviceRoleKey || !accessToken) {
    res.status(401).json({ ok: false, error: "Sign in is required." });
    return;
  }

  const authClient = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await authClient.auth.getUser(accessToken);
  const user = userData.user;
  if (userError || !user) {
    res.status(401).json({ ok: false, error: "Sign in is required." });
    return;
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data: objects, error: listError } = await adminClient.storage
      .from("expressly-private")
      .list(user.id, { limit: 1000 });
    if (listError) throw listError;

    if (objects?.length) {
      const paths = objects.map((object) => `${user.id}/${object.name}`);
      const { error: removeError } = await adminClient.storage
        .from("expressly-private")
        .remove(paths);
      if (removeError) throw removeError;
    }

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Account deletion failed", {
      userId: user.id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    res.status(503).json({ ok: false, error: "Account deletion is temporarily unavailable." });
  }
}
