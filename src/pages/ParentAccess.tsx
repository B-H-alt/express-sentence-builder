import { LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import { ParentDashboard } from "@/components/pecs/ParentDashboard";
import { Button } from "@/components/ui/button";
import { useCurrentAccountPlan } from "@/hooks/useAccountPlan";
import { planIncludes } from "@/lib/plans";

const ParentAccess = () => {
  const { user, plan, loading } = useCurrentAccountPlan();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 text-sm text-muted-foreground">
        Checking account…
      </main>
    );
  }

  if (planIncludes(plan, "parent_dashboard")) {
    return <ParentDashboard />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-foreground">Parent dashboard is locked</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The parent dashboard is included with Expressly Plus and Care.
        </p>
        <div className="mt-6 grid gap-2">
          <Button asChild>
            <Link to="/pricing">View plans</Link>
          </Button>
          {!user && (
            <Button asChild variant="outline">
              <Link to="/pecs-app?account=sign-in">Sign in</Link>
            </Button>
          )}
          <Button asChild variant="ghost">
            <Link to="/pecs-app">Return to Expressly</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default ParentAccess;
