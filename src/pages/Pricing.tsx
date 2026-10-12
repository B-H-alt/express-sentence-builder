import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { PLAN_DETAILS } from "@/lib/plans";

const publicPlans = [PLAN_DETAILS.free, PLAN_DETAILS.plus, PLAN_DETAILS.care_team];

const Pricing = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main className="mx-auto max-w-7xl px-6 pb-24 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Plans</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Choose the support that fits.</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          Start simply, then add more support when the learner needs it.
        </p>
      </div>

      <div className="mt-14 grid gap-5 lg:grid-cols-3">
        {publicPlans.map((plan, index) => (
          <section
            key={plan.name}
            className={`flex flex-col rounded-3xl border bg-card p-7 ${index === 1 ? "border-primary shadow-[0_18px_55px_-35px_hsl(var(--primary))]" : "border-border"}`}
          >
            {index === 1 && <p className="mb-4 w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Best for families</p>}
            <h2 className="text-2xl font-semibold">{plan.name}</h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{plan.shortDescription}</p>
            <div className="mt-7 flex items-end gap-2">
              <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
              {plan.period && <span className="pb-1 text-sm text-muted-foreground">{plan.period}</span>}
            </div>
            <ul className="mt-7 flex-1 space-y-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3 text-sm leading-6">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/pecs-app?account=sign-in"
              className={`mt-8 inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold ${index === 1 ? "bg-primary text-primary-foreground" : "border border-border bg-background hover:bg-muted"}`}
            >
              {index === 0 ? "Open Expressly" : "Create an account"}
            </Link>
          </section>
        ))}
      </div>

      <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-border bg-muted/35 px-5 py-4 text-center text-sm leading-6 text-muted-foreground">
        Subscriptions are not active yet, and Expressly will not collect payment on this page. Prices and limits may change before launch.
      </div>
    </main>
    <Footer />
  </div>
);

export default Pricing;
