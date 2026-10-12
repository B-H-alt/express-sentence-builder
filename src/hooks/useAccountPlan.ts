import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { isAccountPlan, type AccountPlan } from "@/lib/plans";

interface AccountPlanState {
  plan: AccountPlan | null;
  status: string | null;
  validUntil: string | null;
  loading: boolean;
}

const EMPTY_STATE: AccountPlanState = {
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
        if (active) setState(EMPTY_STATE);
        return;
      }

      const { data, error } = await supabase
        .from("account_entitlements")
        .select("plan,status,valid_until")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;
      if (error || !data || !isAccountPlan(data.plan)) {
        setState({ ...EMPTY_STATE, loading: false });
        return;
      }

      setState({
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
