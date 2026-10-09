interface ApiRequest {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

export type ProtectedFeature = "grammar" | "voice" | "image_generation";

type AccessDecision = {
  allowed?: boolean;
  reason?: string;
  retry_after?: number;
  remaining?: number | null;
  plan?: string;
};

const MAX_AUTH_HEADER_LENGTH = 4_096;

export const setPrivateApiHeaders = (res: ApiResponse) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
};

export const rejectUnlessPost = (req: ApiRequest, res: ApiResponse) => {
  if (req.method === "POST") return false;
  res.setHeader("Allow", "POST");
  res.status(405).json({ ok: false, error: "Method not allowed." });
  return true;
};

const getHeader = (req: ApiRequest, name: string) => {
  const value = req.headers[name] ?? req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
};

export const authorizeFeature = async (
  req: ApiRequest,
  feature: ProtectedFeature,
  amount = 1,
) => {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  const authorization = getHeader(req, "authorization")?.trim();

  if (
    !supabaseUrl ||
    !publishableKey ||
    !authorization?.startsWith("Bearer ") ||
    authorization.length > MAX_AUTH_HEADER_LENGTH
  ) {
    return { ok: false as const, status: 401, error: "Sign in is required." };
  }

  const safeAmount = Number.isSafeInteger(amount) && amount > 0 ? amount : 1;
  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/rest/v1/rpc/consume_feature_usage`, {
      method: "POST",
      headers: {
        apikey: publishableKey,
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_feature: feature, p_amount: safeAmount }),
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    return { ok: false as const, status: 503, error: "Account verification is unavailable." };
  }

  if (response.status === 401 || response.status === 403) {
    return { ok: false as const, status: 401, error: "Sign in is required." };
  }
  if (!response.ok) {
    console.error("Feature authorization failed", { feature, status: response.status });
    return { ok: false as const, status: 503, error: "Access verification is unavailable." };
  }

  const decision = (await response.json()) as AccessDecision;
  if (!decision.allowed) {
    const isBurstLimit = decision.reason === "rate_limit_reached";
    const isLimit = isBurstLimit || decision.reason === "limit_reached";
    return {
      ok: false as const,
      status: isLimit ? 429 : 403,
      error: isBurstLimit
        ? "Too many requests. Please wait a moment and try again."
        : decision.reason === "email_not_confirmed"
          ? "Confirm your email before using this feature."
        : isLimit
          ? "This feature has reached its current usage limit."
        : "Your current plan does not include this feature.",
      retryAfter: isBurstLimit && Number.isFinite(decision.retry_after)
        ? Math.max(1, Math.min(60, Math.ceil(decision.retry_after!)))
        : undefined,
    };
  }

  return {
    ok: true as const,
    plan: decision.plan ?? "unknown",
    remaining: decision.remaining ?? null,
  };
};
