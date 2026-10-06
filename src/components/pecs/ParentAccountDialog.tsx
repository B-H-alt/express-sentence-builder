import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Cloud, LogOut, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSupabase, isCloudAccountConfigured } from "@/lib/supabase";

interface ParentAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ParentAccountDialog = ({ open, onOpenChange }: ParentAccountDialogProps) => {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isCloudAccountConfigured) return;

    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    getSupabase().then((supabase) => {
      if (!supabase || !mounted) return;
      supabase.auth.getUser().then(({ data }) => {
        if (mounted) setUser(data.user ?? null);
      });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) setUser(session?.user ?? null);
      });
      unsubscribe = () => data.subscription.unsubscribe();
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    const address = email.trim();
    if (!address) return;

    setLoading(true);
    setMessage("");
    const supabase = await getSupabase();
    if (!supabase) {
      setMessage("Parent accounts are not configured yet.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: address,
      options: {
        emailRedirectTo: `${window.location.origin}/pecs-app`,
      },
    });

    setMessage(error ? "We could not send the sign-in email. Please try again." : "Check your email for a secure sign-in link.");
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    const supabase = await getSupabase();
    await supabase?.auth.signOut();
    setMessage("Signed out on this device.");
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-border/70">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <DialogTitle>Parent account</DialogTitle>
          <DialogDescription>
            Keep learner settings and progress private and available across devices.
          </DialogDescription>
        </DialogHeader>

        {!isCloudAccountConfigured ? (
          <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Cloud accounts are not configured on this version of Expressly.
          </div>
        ) : user ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/35 p-4">
              <Cloud className="mt-0.5 h-5 w-5 text-primary" />
              <div className="min-w-0">
                <p className="font-medium">Signed in</p>
                <p className="truncate text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleSignOut} disabled={loading}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSignIn}>
            <div className="space-y-2">
              <label htmlFor="parent-email" className="text-sm font-medium">Parent email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="parent-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="parent@example.com"
                  className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Sending…" : "Email me a sign-in link"}
            </Button>
            <p className="text-xs leading-relaxed text-muted-foreground">
              No password is needed. The learner does not need their own email.
            </p>
          </form>
        )}

        {message && (
          <p role="status" className="rounded-xl bg-muted px-3 py-2 text-sm text-foreground">
            {message}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
