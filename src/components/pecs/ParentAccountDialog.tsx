import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Cloud, KeyRound, LockKeyhole, LogOut, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getSupabase, isCloudAccountConfigured } from "@/lib/supabase";

interface ParentAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AccountView = "sign-in" | "sign-up" | "forgot" | "reset";

export const ParentAccountDialog = ({ open, onOpenChange }: ParentAccountDialogProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [view, setView] = useState<AccountView>("sign-in");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);

  useEffect(() => {
    if (!isCloudAccountConfigured) return;
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    getSupabase().then((supabase) => {
      if (!supabase || !mounted) return;
      supabase.auth.getUser().then(({ data }) => {
        if (mounted) setUser(data.user ?? null);
      });
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        if (event === "PASSWORD_RECOVERY") {
          setView("reset");
          setMessage("Choose a new password for your parent account.");
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (resetCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResetCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resetCooldown]);

  const finishRequest = (nextMessage: string) => {
    setMessage(nextMessage);
    setLoading(false);
  };

  const changeView = (nextView: AccountView) => {
    setView(nextView);
    setPassword("");
    setConfirmPassword("");
    setMessage("");
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const address = email.trim();
    if (!address || !password) {
      setMessage("Enter your email and password.");
      return;
    }
    if (view === "sign-up" && password.length < 8) {
      setMessage("Use a password with at least 8 characters.");
      return;
    }
    if (view === "sign-up" && password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");
    const supabase = await getSupabase();
    if (!supabase) {
      finishRequest("Parent accounts are not configured yet.");
      return;
    }

    if (view === "sign-up") {
      const { data, error } = await supabase.auth.signUp({
        email: address,
        password,
        options: { emailRedirectTo: `${window.location.origin}/pecs-app` },
      });
      setPassword("");
      setConfirmPassword("");
      if (error) {
        finishRequest(error.message || "We could not create the account. Please try again.");
        return;
      }
      finishRequest(data.session
        ? "Account created. You are signed in."
        : "Account created. Check your email to confirm it before signing in.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: address, password });
    setPassword("");
    finishRequest(error ? "The email or password is incorrect." : "Signed in securely.");
  };

  const handleMagicLink = async () => {
    const address = email.trim();
    if (!address) {
      setMessage("Enter your email first.");
      return;
    }
    setLoading(true);
    setMessage("");
    const supabase = await getSupabase();
    if (!supabase) {
      finishRequest("Parent accounts are not configured yet.");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: address,
      options: {
        emailRedirectTo: `${window.location.origin}/pecs-app`,
        shouldCreateUser: false,
      },
    });
    finishRequest(error
      ? "We could not send the sign-in link. Check the email or create an account first."
      : "If an account exists for that email, a secure sign-in link is on its way.");
  };

  const handleForgotPassword = async (event: FormEvent) => {
    event.preventDefault();
    const address = email.trim();
    if (!address) return;
    if (resetCooldown > 0) {
      setMessage(`Please wait ${resetCooldown} seconds before trying again.`);
      return;
    }
    setLoading(true);
    setMessage("");
    const supabase = await getSupabase();
    if (!supabase) {
      finishRequest("Parent accounts are not configured yet.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(address, {
      redirectTo: `${window.location.origin}/pecs-app`,
    });
    if (error) {
      const isRateLimit = error.status === 429 || error.code === "over_email_send_rate_limit";
      if (isRateLimit) {
        setResetCooldown(60);
        finishRequest("Too many reset emails were requested. Please wait a minute and try again.");
        return;
      }
      finishRequest("We could not send the reset email. Please try again in a moment.");
      return;
    }
    setResetCooldown(60);
    finishRequest("If an account exists for that email, a password reset link is on its way.");
  };

  const handleResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 8) {
      setMessage("Use a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");
    const supabase = await getSupabase();
    if (!supabase) {
      finishRequest("Parent accounts are not configured yet.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    setPassword("");
    setConfirmPassword("");
    if (error) {
      finishRequest("We could not update the password. Please request a new reset link.");
      return;
    }
    setView("sign-in");
    finishRequest("Password updated. You are signed in.");
  };

  const handleSignOut = async () => {
    setLoading(true);
    setMessage("");
    const supabase = await getSupabase();
    await supabase?.auth.signOut();
    finishRequest("Signed out on this device.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto rounded-2xl border-border/70">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <DialogTitle>
            {user && view !== "reset"
              ? "Your account"
              : view === "sign-up"
                ? "Create your account"
                : view === "forgot"
                  ? "Reset your password"
                  : view === "reset"
                    ? "Choose a new password"
                    : "Sign in to Expressly"}
          </DialogTitle>
          <DialogDescription>
            {view === "sign-up"
              ? "Save learner settings and progress across devices."
              : view === "forgot" || view === "reset"
                ? "We’ll help you get back into your account."
                : "Access saved learner settings and progress."}
          </DialogDescription>
        </DialogHeader>

        {!isCloudAccountConfigured ? (
          <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Cloud accounts are not configured on this version of Expressly.
          </div>
        ) : user && view !== "reset" ? (
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
        ) : view === "forgot" ? (
          <form className="space-y-4" onSubmit={handleForgotPassword}>
            <div className="space-y-2">
              <FieldLabel>Email</FieldLabel>
              <EmailField email={email} setEmail={setEmail} />
            </div>
            <Button className="w-full" type="submit" disabled={loading || resetCooldown > 0}>
              {loading
                ? "Sending…"
                : resetCooldown > 0
                  ? `Try again in ${resetCooldown}s`
                  : "Send password reset link"}
            </Button>
            <div className="text-center">
              <TextButton onClick={() => changeView("sign-in")}>Back to sign in</TextButton>
            </div>
          </form>
        ) : view === "reset" ? (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <PasswordFields
              password={password}
              confirmPassword={confirmPassword}
              setPassword={setPassword}
              setConfirmPassword={setConfirmPassword}
              includeConfirmation
            />
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save new password"}
            </Button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div className="space-y-2">
              <FieldLabel>Email</FieldLabel>
              <EmailField email={email} setEmail={setEmail} />
            </div>
            <PasswordFields
              password={password}
              confirmPassword={confirmPassword}
              setPassword={setPassword}
              setConfirmPassword={setConfirmPassword}
              includeConfirmation={view === "sign-up"}
            />
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Please wait…" : view === "sign-up" ? "Create parent account" : "Sign in"}
            </Button>
            {view === "sign-in" && (
              <div className="space-y-3 text-center">
                <TextButton onClick={() => changeView("forgot")}>Forgot password?</TextButton>
                <div className="flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                  or
                </div>
                <Button type="button" variant="outline" className="w-full" onClick={handleMagicLink} disabled={loading}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Email me a sign-in link
                </Button>
              </div>
            )}
            <p className="text-xs leading-relaxed text-muted-foreground">
              This account belongs to the parent or caregiver. The learner does not need an email.
            </p>
            <p className="text-center text-sm text-muted-foreground">
              {view === "sign-up" ? "Already have an account? " : "Don’t have an account? "}
              <button
                type="button"
                onClick={() => changeView(view === "sign-up" ? "sign-in" : "sign-up")}
                className="font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {view === "sign-up" ? "Sign in" : "Sign up"}
              </button>
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

const FieldLabel = ({ children }: { children: string }) => (
  <label className="text-sm font-medium">{children}</label>
);

const EmailField = ({ email, setEmail }: { email: string; setEmail: (value: string) => void }) => (
  <div className="relative">
    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <input
      type="email"
      autoComplete="email"
      required
      value={email}
      onChange={(event) => setEmail(event.target.value)}
      placeholder="parent@example.com"
      className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
    />
  </div>
);

const PasswordFields = ({ password, confirmPassword, setPassword, setConfirmPassword, includeConfirmation }: {
  password: string;
  confirmPassword: string;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  includeConfirmation: boolean;
}) => (
  <div className="space-y-3">
    <div className="space-y-2">
      <FieldLabel>Password</FieldLabel>
      <div className="relative">
        <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="password"
          autoComplete={includeConfirmation ? "new-password" : "current-password"}
          required
          minLength={includeConfirmation ? 8 : undefined}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={includeConfirmation ? "At least 8 characters" : "Password"}
          className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
    {includeConfirmation && (
      <div className="space-y-2">
        <FieldLabel>Confirm password</FieldLabel>
        <div className="relative">
          <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Enter it again"
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
    )}
  </div>
);

const TextButton = ({ children, onClick }: { children: string; onClick: () => void }) => (
  <button type="button" onClick={onClick} className="text-sm font-medium text-primary hover:underline">
    {children}
  </button>
);
