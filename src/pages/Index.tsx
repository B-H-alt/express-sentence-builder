import { Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, Layers3, MessageSquareText, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const steps = [
  { number: "01", title: "Choose a picture", text: "Find the person, feeling, action, or object that matches what you want to say." },
  { number: "02", title: "Build the message", text: "Place pictures into the sentence strip in the order that makes sense to you." },
  { number: "03", title: "Share it", text: "Show the finished message or play it aloud when you are ready." },
];

const features = [
  { icon: Layers3, title: "Grows with the learner", text: "Move between three vocabulary levels without changing how the app works." },
  { icon: SlidersHorizontal, title: "Easy to personalize", text: "Add custom cards, choose the number of cards shown, and adjust the display." },
  { icon: MessageSquareText, title: "Made for real moments", text: "Keep useful words and phrases together for home, school, therapy, and daily life." },
];

const Index = () => {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    elements.forEach((element) => {
      element.style.transitionDelay = `${element.dataset.revealDelay ?? 0}ms`;
    });
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8%" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
  <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main>
      <section className="overflow-hidden border-b border-border/70 pt-28 md:pt-36">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 md:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:pb-28">
          <div className="max-w-xl" data-reveal>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">Picture based communication</p>
            <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-0.045em] md:text-7xl">Say what you mean, one picture at a time.</h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-muted-foreground md:text-xl">Expressly helps visual communicators choose pictures, build a message, and share it clearly.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/pecs-app" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">Open Expressly <ArrowRight className="h-4 w-4" /></Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3.5 font-semibold transition-colors hover:bg-muted">See how it works</a>
            </div>
          </div>
          <div className="relative" data-reveal data-reveal-delay="120">
            <div className="absolute -inset-12 -z-10 rounded-full bg-secondary/10 blur-3xl" />
            <div className="overflow-hidden rounded-[2rem] border border-border bg-card p-2 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.35)] md:p-3">
              <img src="/pecs-screenshot.png" alt="Expressly picture cards and sentence builder" className="w-full rounded-[1.4rem]" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-muted/35">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-7 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10" data-reveal>
          <span className="font-semibold text-foreground">Designed for everyday communication</span>
          <div className="flex flex-wrap gap-x-8 gap-y-2"><span>At home</span><span>At school</span><span>In therapy</span></div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="max-w-2xl" data-reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">How it works</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] md:text-5xl">Clear enough to use in the moment.</h2>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-background p-8 md:min-h-64 md:p-10"
              data-reveal
              data-reveal-delay={String(Number(step.number) * 70)}
            >
              <span className="font-mono text-sm text-muted-foreground">{step.number}</span>
              <h3 className="mt-12 text-2xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="max-w-md" data-reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">Built to adapt</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] md:text-5xl">The same simple experience, shaped around the learner.</h2>
            </div>
            <div className="divide-y divide-primary-foreground/15 border-y border-primary-foreground/15">
              {features.map(({ icon: Icon, title, text }) => (
                <div key={title} className="grid gap-4 py-7 sm:grid-cols-[48px_1fr]" data-reveal>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-foreground/10"><Icon className="h-5 w-5" /></div>
                  <div><h3 className="text-xl font-semibold">{title}</h3><p className="mt-2 max-w-xl leading-7 text-primary-foreground/70">{text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24 text-center md:py-32" data-reveal>
        <h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Communication should not have to wait.</h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Open Expressly and start building a message with the pictures that matter to you.</p>
        <Link to="/pecs-app" className="mt-9 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">Open Expressly <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </main>
    <Footer />
  </div>
  );
};

export default Index;
