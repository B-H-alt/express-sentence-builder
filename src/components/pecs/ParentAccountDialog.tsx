import { FormEvent, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { AlertTriangle, Cloud, Download, KeyRound, LockKeyhole, LogOut, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getSupabase, isCloudAccountConfigured, isSocialProviderEnabled, type SocialProvider } from "@/lib/supabase";
import { clearAccountStorage, switchAccountStorage } from "@/lib/accountStorage";
import { isCaptchaConfigured } from "@/lib/captcha";
import { TurnstileCheck } from "./TurnstileCheck";
import { getAccountRedirectUrl } from "@/lib/runtimeUrls";
import { getApiUrl } from "@/lib/runtimeUrls";
import { downloadExpresslyData } from "@/lib/accountDataExport";

interface ParentAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AccountView = "sign-in" | "sign-up" | "confirm-email" | "other-methods" | "email-link" | "forgot" | "reset";
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;
const PASSWORD_REQUIREMENTS = "Use at least 12 characters with uppercase, lowercase, a number, and a symbol.";
const ACCOUNT_AGREEMENT_VERSION = "2026-10-11";
const SOCIAL_AGREEMENT_KEY = "expressly-social-agreement-v1";

const isStrongPassword = (password: string) =>
  password.length >= MIN_PASSWORD_LENGTH &&
  password.length <= MAX_PASSWORD_LENGTH &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

export const ParentAccountDialog = ({ open, onOpenChange }: ParentAccountDialogProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [view, setView] = useState<AccountView>("sign-in");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialProvider, setSocialProvider] = useState<SocialProvider | null>(null);
  const [resetCooldown, setResetCooldown] = useState(0);
  const [confirmationCooldown, setConfirmationCooldown] = useState(0);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [signupMayExist, setSignupMayExist] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [alternateReturnView, setAlternateReturnView] = useState<"sign-in" | "sign-up">("sign-in");
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const loginPending = useRef(false);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const confirmationTitleRef = useRef<HTMLHeadingElement>(null);
  const accountTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (open && view === "confirm-email") confirmationTitleRef.current?.focus();
  }, [open, view]);

  useEffect(() => {
    if (message) messageRef.current?.scrollIntoView({ block: "nearest" });
  }, [message]);

  const openSignedInApp = () => window.location.replace(
    ["/caregiver", "/parent"].includes(window.location.pathname)
      ? "/caregiver"
      : "/pecs-app?account=signed-in"
  );

  useEffect(() => {
    if (!isCloudAccountConfigured) return;
    const callback = new URL(window.location.href);
    const callbackHash = new URLSearchParams(callback.hash.slice(1));
    if (callback.searchParams.has("error") || callbackHash.has("error")) {
      window.sessionStorage.removeItem(SOCIAL_AGREEMENT_KEY);
      setMessage("Sign-in was not completed. Please try Google or Apple again, or use your email and password.");
      for (const key of ["error", "error_code", "error_description"]) {
        callback.searchParams.delete(key);
        callbackHash.delete(key);
      }
      callback.hash = callbackHash.toString();
      window.history.replaceState(window.history.state, "", callback);
    }
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    getSupabase().then((supabase) => {
      if (!supabase || !mounted) return;
      let completingSocialSignIn = false;
      const completeSocialSignIn = async (nextUser: User) => {
        if (completingSocialSignIn) return;
        completingSocialSignIn = true;
        try {
          const acceptedAt = window.sessionStorage.getItem(SOCIAL_AGREEMENT_KEY);
          if (acceptedAt && !nextUser.user_metadata.account_agreement_accepted_at) {
            const { error } = await supabase.auth.updateUser({
              data: {
                account_agreement_version: ACCOUNT_AGREEMENT_VERSION,
                account_agreement_accepted_at: acceptedAt,
              },
            });
            if (error) throw error;
          }
          if (!mounted) return;
          window.sessionStorage.removeItem(SOCIAL_AGREEMENT_KEY);
          switchAccountStorage(nextUser.id);
          openSignedInApp();
        } catch {
          if (mounted) {
            setMessage("You are signed in, but we could not save your account agreement. Please reload to try again.");
          }
          completingSocialSignIn = false;
        }
      };
      supabase.auth.getUser().then(({ data }) => {
        if (!mounted) return;
        setUser(data.user ?? null);
        if (data.user && window.sessionStorage.getItem(SOCIAL_AGREEMENT_KEY)) {
          void completeSocialSignIn(data.user);
          return;
        }
        if (switchAccountStorage(data.user?.id ?? null)) {
          if (data.user) openSignedInApp();
          else window.location.reload();
        }
      });
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        if (event === "SIGNED_IN" && session?.user && window.sessionStorage.getItem(SOCIAL_AGREEMENT_KEY)) {
          // Supabase calls this listener while holding its Auth lock. Save
          // agreement metadata after the listener returns, outside that lock.
          window.setTimeout(() => {
            if (mounted) void completeSocialSignIn(session.user);
          }, 0);
          return;
        }
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          const accountChanged = switchAccountStorage(session?.user?.id ?? null);
          if (event === "SIGNED_IN" && (accountChanged || loginPending.current)) {
            openSignedInApp();
            return;
          }
          if (accountChanged) {
            window.location.reload();
            return;
          }
        }
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

  useEffect(() => {
    if (confirmationCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setConfirmationCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [confirmationCooldown]);

  const finishRequest = (nextMessage: string) => {
    setMessage(nextMessage);
    setLoading(false);
  };

  const changeView = (nextView: AccountView) => {
    setView(nextView);
    setPassword("");
    setConfirmPassword("");
    setMessage("");
    setAgreementAccepted(false);
    setCaptchaToken("");
    setCaptchaResetKey((value) => value + 1);
  };

  const resetCaptcha = () => {
    setCaptchaToken("");
    setCaptchaResetKey((value) => value + 1);
  };

  const handleSocialSignIn = async (provider: SocialProvider) => {
    if (loading) return;
    if (!agreementAccepted) {
      setMessage("Please read and accept the account agreement before continuing.");
      return;
    }
    const name = provider === "google" ? "Google" : "Apple";
    // The installed shell needs a system-browser flow and a verified app callback.
    // Do not send Google credentials into an embedded web view or strand the
    // resulting session in the website instead of signing into the installed app.
    if (Capacitor.isNativePlatform()) {
      setMessage(`${name} sign-in for the installed app is not ready yet. Please use email and password here, or visit www.expressly.us in your browser.`);
      return;
    }
    setLoading(true);
    setSocialProvider(provider);
    setMessage("");
    try {
      const supabase = await getSupabase();
      if (!supabase) throw new Error("Accounts unavailable");
      if (!await isSocialProviderEnabled(provider)) {
        finishRequest(`${name} sign-in is not available yet. Please try another sign-in method.`);
        return;
      }
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: getAccountRedirectUrl(),
          skipBrowserRedirect: true,
        },
      });
      if (error || !data.url) throw new Error("Sign-in unavailable");
      window.sessionStorage.setItem(SOCIAL_AGREEMENT_KEY, new Date().toISOString());
      window.location.assign(data.url);
    } catch {
      finishRequest(`We could not start ${name} sign-in. Check your connection and try again.`);
    } finally {
      setSocialProvider(null);
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const address = email.trim();
    if (!address || !password) {
      setMessage("Enter your email and password.");
      return;
    }
    if (view === "sign-up" && !isStrongPassword(password)) {
      setMessage(PASSWORD_REQUIREMENTS);
      return;
    }
    if (view === "sign-up" && password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }
    if (view === "sign-up" && !agreementAccepted) {
      setMessage("Please read and accept the account agreement.");
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
        options: {
          emailRedirectTo: getAccountRedirectUrl(),
          captchaToken: captchaToken || undefined,
          data: {
            account_agreement_version: ACCOUNT_AGREEMENT_VERSION,
            account_agreement_accepted_at: new Date().toISOString(),
          },
        },
      });
      resetCaptcha();
      setPassword("");
      setConfirmPassword("");
      if (error) {
        finishRequest(error.status === 429
          ? "Too many attempts. Please wait a minute before trying again."
          : "We could not create your account or send the confirmation email. Please try again in a moment.");
        return;
      }
      if (data.session) {
        finishRequest("Account created. You are signed in.");
      } else {
        setConfirmationEmail(address);
        setSignupMayExist(data.user?.identities?.length === 0);
        setConfirmationCooldown(60);
        setView("confirm-email");
        finishRequest("");
      }
      return;
    }

    loginPending.current = true;
    const { error } = await supabase.auth.signInWithPassword({
      email: address,
      password,
      options: { captchaToken: captchaToken || undefined },
    });
    resetCaptcha();
    setPassword("");
    if (!error) {
      openSignedInApp();
      return;
    }
    loginPending.current = false;
    finishRequest(error ? "The email or password is incorrect." : "Signed in securely.");
  };

  const handleResendConfirmation = async () => {
    if (loading || confirmationCooldown > 0) return;
    setLoading(true);
    setMessage("");
    try {
      const supabase = await getSupabase();
      if (!supabase) throw new Error("Accounts unavailable");
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: confirmationEmail,
        options: {
          emailRedirectTo: getAccountRedirectUrl(),
          captchaToken: captchaToken || undefined,
        },
      });
      resetCaptcha();
      if (error) {
        if (error.status === 429) setConfirmationCooldown(60);
        finishRequest(error.status === 429
          ? "Please wait a minute before requesting another confirmation email."
          : "We could not resend the email. Please try again in a moment.");
        return;
      }
      setConfirmationCooldown(60);
      finishRequest("Confirmation email requested. Check your inbox and spam folder. If you already confirmed this email, sign in instead.");
    } catch {
      resetCaptcha();
      finishRequest("We could not reach the email service. Check your connection and try again.");
    }
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
        emailRedirectTo: getAccountRedirectUrl(),
        shouldCreateUser: false,
        captchaToken: captchaToken || undefined,
      },
    });
    resetCaptcha();
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
      redirectTo: getAccountRedirectUrl(),
      captchaToken: captchaToken || undefined,
    });
    resetCaptcha();
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
    if (!isStrongPassword(password)) {
      setMessage(PASSWORD_REQUIREMENTS);
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

  const handleDownloadData = () => {
    if (!user) return;
    downloadExpresslyData({ id: user.id, email: user.email });
    setMessage("Your Expressly data was downloaded to this device.");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;
    setLoading(true);
    setMessage("");
    const supabase = await getSupabase();
    const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
    const accessToken = data.session?.access_token;
    if (!supabase || !accessToken) {
      finishRequest("Sign in again before deleting the account.");
      return;
    }

    try {
      const response = await fetch(getApiUrl("/api/account/delete"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        finishRequest(body.error || "We could not delete the account. Please try again.");
        return;
      }
      clearAccountStorage(user.id);
      await supabase.auth.signOut({ scope: "local" });
      window.location.reload();
    } catch {
      finishRequest("We could not delete the account. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] max-w-md overflow-y-auto rounded-2xl border-border/70"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          (confirmationTitleRef.current ?? accountTitleRef.current)?.focus();
        }}
      >
        {view === "confirm-email" && !user ? (
          <>
            <DialogHeader className="space-y-4 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-6 w-6" aria-hidden="true" />
              </div>
              <DialogTitle ref={confirmationTitleRef} tabIndex={-1} className="text-2xl leading-tight focus:outline-none">
                {signupMayExist ? "Check your email or sign in" : "Account created"}
              </DialogTitle>
              <DialogDescription className="text-base leading-relaxed text-foreground">
                {signupMayExist
                  ? "If you have used this email before, sign in or reset your password. For a new account, check your email for a confirmation link."
                  : "Check your email to confirm your account. Open the confirmation message and select the link before signing in."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <p className="break-words rounded-xl bg-muted px-4 py-3 text-base font-medium">{confirmationEmail}</p>
              <p className="text-sm leading-relaxed text-foreground/80">
                Look for an email from Expressly. It may take a few minutes. Check your spam or junk folder, too.
              </p>
              {message && <p role="status" className="rounded-xl bg-muted px-4 py-3 text-sm">{message}</p>}
              <TurnstileCheck onToken={setCaptchaToken} resetKey={captchaResetKey} />
              <div className="space-y-3">
                <Button className="min-h-11 w-full" onClick={() => changeView("sign-in")} disabled={loading}>
                  Back to sign in
                </Button>
                <Button
                  variant="outline"
                  className="min-h-11 w-full"
                  onClick={handleResendConfirmation}
                  disabled={loading || confirmationCooldown > 0 || (isCaptchaConfigured && !captchaToken)}
                >
                  {loading ? "Sending…" : confirmationCooldown > 0 ? `Resend email in ${confirmationCooldown}s` : "Resend confirmation email"}
                </Button>
                <div className="text-center">
                  <TextButton onClick={() => { if (!loading) changeView("sign-up"); }}>Use a different email</TextButton>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">
                Already have an account with this email? Sign in or reset your password instead.
              </p>
            </div>
          </>
        ) : (
          <>
        <DialogHeader>
          <DialogTitle ref={accountTitleRef} tabIndex={-1} className="text-2xl focus:outline-none">
            {user && view !== "reset"
              ? "Your account"
              : view === "other-methods"
                ? "Other ways to continue"
                : view === "email-link"
                  ? "Sign in with an email link"
                  : view === "sign-up"
                ? "Create your account"
                : view === "forgot"
                  ? "Reset your password"
                  : view === "reset"
                    ? "Choose a new password"
                    : "Sign in to Expressly"}
          </DialogTitle>
          <DialogDescription className="text-base text-foreground/80">
            {user && view !== "reset"
              ? "Manage your Expressly account."
              : view === "sign-up"
              ? "For parents and caregivers. The learner does not need an email."
              : view === "other-methods"
                ? "Choose how you want to continue."
                : view === "email-link"
                  ? "We’ll email you a link that signs you in. No password needed. You must already have an account."
                  : view === "forgot" || view === "reset"
                    ? "We’ll help you get back into your account."
                    : "Welcome back. Enter your email and password."}
          </DialogDescription>
        </DialogHeader>

        {message && (
          <p ref={messageRef} role="status" className="rounded-xl bg-muted px-3 py-2 text-sm text-foreground">
            {message}
          </p>
        )}
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
            <Button variant="outline" className="w-full" onClick={handleDownloadData} disabled={loading}>
              <Download className="mr-2 h-4 w-4" />
              Download my data
            </Button>
            {!showDeleteAccount ? (
              <button
                type="button"
                onClick={() => setShowDeleteAccount(true)}
                className="mx-auto flex items-center gap-2 text-sm font-medium text-destructive hover:underline"
              >
                <Trash2 className="h-4 w-4" />
                Delete account
              </button>
            ) : (
              <div className="space-y-3 rounded-xl border border-destructive/35 bg-destructive/5 p-4">
                <div className="flex gap-2 text-sm text-foreground">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <p>This permanently deletes the parent account, learner profiles, saved progress, and private images.</p>
                </div>
                <label className="block text-xs font-medium text-muted-foreground" htmlFor="delete-account-confirmation">
                  Type DELETE to confirm
                </label>
                <input
                  id="delete-account-confirmation"
                  value={deleteConfirmation}
                  onChange={(event) => setDeleteConfirmation(event.target.value)}
                  autoComplete="off"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDeleteAccount}
                    disabled={loading || deleteConfirmation !== "DELETE"}
                  >
                    {loading ? "Deleting…" : "Delete permanently"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowDeleteAccount(false);
                      setDeleteConfirmation("");
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : view === "other-methods" ? (
          <div className="space-y-5">
            <div className="space-y-3">
              <AccountAgreement accepted={agreementAccepted} onAcceptedChange={setAgreementAccepted} />
              <Button
                type="button"
                className="h-11 w-full border border-[#747775] bg-white font-medium text-[#1f1f1f] hover:bg-[#f2f2f2]"
                onClick={() => handleSocialSignIn("google")}
                disabled={loading || !agreementAccepted}
              >
                <img src="/auth/google.png" alt="" className="h-5 w-5" />
                {socialProvider === "google" ? "Connecting to Google…" : "Continue with Google"}
              </Button>
              <Button
                type="button"
                className="h-11 w-full overflow-hidden bg-black p-0 text-white hover:bg-black/90"
                onClick={() => handleSocialSignIn("apple")}
                disabled={loading || !agreementAccepted}
                aria-label={socialProvider === "apple" ? "Connecting to Apple" : "Continue with Apple"}
              >
                {socialProvider === "apple"
                  ? "Connecting to Apple…"
                  : <img src="/auth/apple-continue.png" alt="" className="h-11 max-w-full object-contain" />}
              </Button>
            </div>
            {alternateReturnView === "sign-in" && (
              <Button variant="outline" className="min-h-11 w-full" onClick={() => changeView("email-link")} disabled={loading}>
                <KeyRound className="mr-2 h-4 w-4" />
                Sign in without a password
              </Button>
            )}
            <div className="text-center">
              <TextButton onClick={() => { if (!loading) changeView(alternateReturnView); }}>Back to email and password</TextButton>
            </div>
          </div>
        ) : view === "email-link" ? (
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void handleMagicLink(); }}>
            <div className="space-y-2">
              <FieldLabel htmlFor="account-email">Email</FieldLabel>
              <EmailField email={email} setEmail={setEmail} />
            </div>
            <TurnstileCheck onToken={setCaptchaToken} resetKey={captchaResetKey} />
            <Button type="submit" className="min-h-11 w-full" disabled={loading || (isCaptchaConfigured && !captchaToken)}>
              {loading ? "Sending…" : "Send sign-in link"}
            </Button>
            <div className="text-center">
              <TextButton onClick={() => changeView("sign-in")}>Back to sign in</TextButton>
            </div>
          </form>
        ) : view === "forgot" ? (
          <form className="space-y-4" onSubmit={handleForgotPassword}>
            <div className="space-y-2">
              <FieldLabel htmlFor="account-email">Email</FieldLabel>
              <EmailField email={email} setEmail={setEmail} />
            </div>
            <TurnstileCheck onToken={setCaptchaToken} resetKey={captchaResetKey} />
            <Button
              className="w-full"
              type="submit"
              disabled={loading || resetCooldown > 0 || (isCaptchaConfigured && !captchaToken)}
            >
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
          <Tabs value={view} onValueChange={(nextView) => changeView(nextView as AccountView)}>
            <TabsList className="mb-4 grid h-12 w-full grid-cols-2 text-foreground/80" aria-label="Account access">
              <TabsTrigger className="h-10 text-base" value="sign-in" disabled={loading}>Sign in</TabsTrigger>
              <TabsTrigger className="h-10 text-base" value="sign-up" disabled={loading}>Create account</TabsTrigger>
            </TabsList>
            <TabsContent value={view} tabIndex={-1} className="mt-0">
              <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                <div className="space-y-2">
                  <FieldLabel htmlFor="account-email">Email</FieldLabel>
                  <EmailField email={email} setEmail={setEmail} />
                </div>
                <PasswordFields
                  password={password}
                  confirmPassword={confirmPassword}
                  setPassword={setPassword}
                  setConfirmPassword={setConfirmPassword}
                  includeConfirmation={view === "sign-up"}
                />
                {view === "sign-up" && <AccountAgreement accepted={agreementAccepted} onAcceptedChange={setAgreementAccepted} />}
                <TurnstileCheck onToken={setCaptchaToken} resetKey={captchaResetKey} />
                <Button
                  className="min-h-11 w-full"
                  type="submit"
                  disabled={loading || (view === "sign-up" && !agreementAccepted) || (isCaptchaConfigured && !captchaToken)}
                >
                  {loading ? "Please wait…" : view === "sign-up" ? "Create parent account" : "Sign in"}
                </Button>
                {view === "sign-in" && (
                  <div className="text-center">
                    <TextButton onClick={() => changeView("forgot")}>Forgot password?</TextButton>
                  </div>
                )}
              </form>
              <div className="mt-5 border-t border-border pt-4 text-center">
                <TextButton onClick={() => {
                  if (loading) return;
                  setAlternateReturnView(view === "sign-up" ? "sign-up" : "sign-in");
                  changeView("other-methods");
                }}>Other ways to continue</TextButton>
              </div>
            </TabsContent>
          </Tabs>
        )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const FieldLabel = ({ children, htmlFor }: { children: string; htmlFor?: string }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium">{children}</label>
);

const EmailField = ({ email, setEmail }: { email: string; setEmail: (value: string) => void }) => (
  <div className="relative">
    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <input
      id="account-email"
      type="email"
      autoComplete="email"
      required
      value={email}
      onChange={(event) => setEmail(event.target.value)}
      placeholder="parent@example.com"
      className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-base outline-none ring-offset-background focus:ring-2 focus:ring-ring"
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
      <FieldLabel htmlFor="account-password">Password</FieldLabel>
      <div className="relative">
        <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="account-password"
          type="password"
          autoComplete={includeConfirmation ? "new-password" : "current-password"}
          required
          minLength={includeConfirmation ? MIN_PASSWORD_LENGTH : undefined}
          maxLength={MAX_PASSWORD_LENGTH}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={includeConfirmation ? `At least ${MIN_PASSWORD_LENGTH} characters` : "Password"}
          className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-base outline-none ring-offset-background focus:ring-2 focus:ring-ring"
        />
      </div>
      {includeConfirmation && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {PASSWORD_REQUIREMENTS}
        </p>
      )}
    </div>
    {includeConfirmation && (
      <div className="space-y-2">
        <FieldLabel htmlFor="account-password-confirm">Confirm password</FieldLabel>
        <div className="relative">
          <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="account-password-confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            maxLength={MAX_PASSWORD_LENGTH}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Enter it again"
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-base outline-none ring-offset-background focus:ring-2 focus:ring-ring"
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

const AccountAgreement = ({ accepted, onAcceptedChange }: {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
}) => (
  <div className="space-y-2 rounded-xl border border-border bg-muted/25 p-3">
    <div className="flex items-start gap-3 text-sm leading-relaxed">
      <input
        id="account-agreement"
        type="checkbox"
        checked={accepted}
        onChange={(event) => onAcceptedChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-primary"
      />
      <span>
        <label htmlFor="account-agreement" className="cursor-pointer">I agree to the </label>
        <a href="/terms" target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">Terms of Use</a>
        {" "}and acknowledge the{" "}
        <a href="/privacy" target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">Privacy Policy</a>.
      </span>
    </div>
    <details className="pl-7 text-xs leading-relaxed text-muted-foreground">
      <summary className="cursor-pointer font-medium text-primary">Read the agreement</summary>
      <ul className="mt-2 list-disc space-y-1.5 pl-4">
        <li>I am an adult authorized to create and manage this account.</li>
        <li>Expressly supports communication. It is not medical advice or an emergency service.</li>
        <li>I will only upload information and images I have permission to use.</li>
        <li>I will use Expressly responsibly and supervise the learner when appropriate.</li>
      </ul>
    </details>
  </div>
);
