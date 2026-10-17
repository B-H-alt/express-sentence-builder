import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { hasSeenAppWelcome, isAccountEntry, rememberAppWelcome } from "@/lib/appWelcome";

const Brand = () => (
  <div className="flex flex-col items-center">
    <img src="/handmade-logo.png" alt="" className="h-20 w-20 object-contain" />
    <h1 className="mt-5 text-4xl font-semibold tracking-tight text-primary">Expressly</h1>
  </div>
);

export const AppLoadingScreen = () => (
  <div role="status" className="app-safe-top app-safe-bottom flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 text-center">
    <Brand />
    <p className="mt-5 text-sm text-muted-foreground">Opening Expressly…</p>
  </div>
);

export const AppWelcome = ({ onOpen, onSignIn }: { onOpen: () => void; onSignIn: () => void }) => {
  const [help, setHelp] = useState(false);
  return (
    <main className="app-safe-top app-safe-bottom flex min-h-[100dvh] items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <Brand />
        <p className="mt-4 text-lg text-muted-foreground">Communicate with pictures.</p>
        <Button className="mt-10 h-14 w-full rounded-xl text-base" onClick={onOpen}>Open Expressly</Button>
        <div className="mt-4 flex flex-wrap justify-center gap-x-6">
          <button className="min-h-12 rounded-lg px-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={onSignIn}>Sign in</button>
          <button className="min-h-12 rounded-lg px-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setHelp(true)}>How to use Expressly</button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">No account needed to get started.</p>
      </div>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>How to use Expressly</DialogTitle>
            <DialogDescription>Three steps to make a message.</DialogDescription>
          </DialogHeader>
          <ol className="list-decimal space-y-4 pl-5 text-sm leading-6">
            <li>Choose a category.</li><li>Tap cards to build a sentence.</li><li>Press Speak to read it aloud.</li>
          </ol>
          <Button className="mt-2 min-h-12" onClick={onOpen}>Open Expressly</Button>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export const NativeAppEntry = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const accountEntry = isAccountEntry(location.search, location.hash);
  const [entered, setEntered] = useState(() => hasSeenAppWelcome() || accountEntry);
  useEffect(() => {
    if (accountEntry) { rememberAppWelcome(); setEntered(true); }
  }, [accountEntry]);
  const open = () => { rememberAppWelcome(); setEntered(true); };
  if (entered || accountEntry) return children;
  return <AppWelcome onOpen={open} onSignIn={() => { open(); navigate("/pecs-app?account=sign-in"); }} />;
};

// Explicit browser preview, without changing the normal website/app entrance.
export const AppWelcomePreview = () => {
  const navigate = useNavigate();
  return <AppWelcome onOpen={() => navigate("/pecs-app")} onSignIn={() => navigate("/pecs-app?account=sign-in")} />;
};
