import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { isAccountPlan, type AccountPlan } from "@/lib/plans";

interface AccountPlanState {
  userId: string | null;
  plan: AccountPlan | null;
  status: string | null;
  validUntil: string | null;
  loading: boolean;
}

const EMPTY_STATE: AccountPlanState = {
  userId: null,
  plan: null,
  status: null,
  validUntil: null,
  loading: false,
};

export const useAccountPlan = (user: User | null): AccountPlanState => {
  const [state, setState] = useState<AccountPlanState>(EMPTY_STATE);

  useEffect(() => {
    let active = true;
    if (!user) {
      setState(EMPTY_STATE);
      return () => { active = false; };
    }

    setState((current) => ({ ...current, loading: true }));
    getSupabase().then(async (supabase) => {
      if (!supabase) {
        if (active) setState({ ...EMPTY_STATE, userId: user.id });
        return;
      }

      const { data, error } = await supabase
        .from("account_entitlements")
        .select("plan,status,valid_until")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;
      if (error || !data || !isAccountPlan(data.plan)) {
        setState({ ...EMPTY_STATE, userId: user.id, loading: false });
        return;
      }

      setState({
        userId: user.id,
        plan: data.plan,
        status: typeof data.status === "string" ? data.status : null,
        validUntil: typeof data.valid_until === "string" ? data.valid_until : null,
        loading: false,
      });
    });

    return () => { active = false; };
  }, [user]);

  return state;
};

export const useCurrentAccountPlan = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    getSupabase().then(async (supabase) => {
      if (!active || !supabase) {
        if (active) setAuthLoading(false);
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (active) {
        setUser(data.user ?? null);
        setAuthLoading(false);
      }

      const listener = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        setUser(session?.user ?? null);
        setAuthLoading(false);
      });
      unsubscribe = () => listener.data.subscription.unsubscribe();
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const entitlement = useAccountPlan(user);

  return {
    user,
    plan: entitlement.plan ?? "free",
    status: entitlement.status,
    validUntil: entitlement.validUntil,
    loading: authLoading || entitlement.loading || (!!user && entitlement.userId !== user.id),
  } as const;
};
