import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const steps = [
  { number: "1", title: "Pick a picture.", text: "Find a word for what you want to say." },
  { number: "2", title: "Put words together.", text: "Tap cards to build your message." },
  { number: "3", title: "Say it aloud.", text: "Press Speak, or show your message to someone." },
];

const features = [
  { title: "Five vocabulary levels", text: "Choose how many words appear on the board." },
  { title: "Custom cards", text: "Add photos of family, favorite foods, or places you visit." },
  { title: "Display settings", text: "Change card size, text, and colors, or turn on Calm mode." },
];

const Index = () => {
  const landing = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = landing.current;
    if (!root || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const elements = root.querySelectorAll<HTMLElement>('[data-landing-reveal]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('landing-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    root.classList.add('landing-motion-ready');
    elements.forEach((element) => observer.observe(element));
    // Keyboard navigation must never focus an invisible link.
    const revealFocus = (event: FocusEvent) => {
      if (event.target instanceof Element) event.target.closest('[data-landing-reveal]')?.classList.add('landing-visible');
    };
    root.addEventListener('focusin', revealFocus);
    return () => {
      observer.disconnect();
      root.classList.remove('landing-motion-ready');
      root.removeEventListener('focusin', revealFocus);
    };
  }, []);
  return (
  <div ref={landing} className="expressly-landing min-h-screen bg-background text-foreground">
    <Navbar />
    <main>
      <section className="overflow-hidden pt-32 md:pt-40">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 pb-12 md:gap-16 md:px-10">
          <div className="max-w-3xl text-center" data-landing-reveal>
            <p className="mb-5 text-sm font-semibold tracking-wide text-primary">Picture based communication</p>
            <h1 className="text-5xl font-semibold leading-[1.08] tracking-[-0.045em] md:text-7xl">More ways to say what’s on your mind.</h1>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/pecs-app" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">Open Expressly <ArrowRight className="h-4 w-4" /></Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center px-6 py-3.5 font-medium text-primary underline-offset-4 hover:underline">See how it works ↓</a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Try the board without an account.</p>
          </div>
          <div className="landing-preview w-full" data-landing-reveal>
            <div className="overflow-hidden rounded-2xl border border-border bg-muted/30 p-1.5 shadow-[0_16px_48px_-24px_rgba(15,23,42,0.22)] md:p-2.5">
              <img src="/pecs-screenshot.png" alt="Expressly picture cards and sentence builder" className="w-full rounded-xl" fetchPriority="high" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-muted/35">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-7 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10">
          <span className="font-semibold text-foreground">An AAC app for communicating with pictures</span>
          <div className="flex flex-wrap gap-x-8 gap-y-2"><span>At home</span><span>At school</span><span>In therapy</span></div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-16 md:px-10 md:py-24">
        <div className="max-w-2xl" data-landing-reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary">How it works</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Tap cards. Build a sentence. Press Speak.</h2>
        </div>
        <div className="mt-10 grid gap-9 md:grid-cols-3 md:gap-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className="py-3"
              data-landing-reveal
              style={{ transitionDelay: `${(Number(step.number) - 1) * 75}ms` }}
            >
              <span className="font-mono text-sm text-muted-foreground">{step.number}</span>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="scroll-mt-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="max-w-md" data-landing-reveal>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Choose what’s on the board.</h2>
              <p className="mt-5 leading-7 text-muted-foreground">
                Add your own cards and adjust the settings whenever you need to.
              </p>
            </div>
            <div className="space-y-8">
              {features.map(({ title, text }) => (
                <div key={title} data-landing-reveal>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-2 max-w-xl leading-7 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 text-center md:py-24" data-landing-reveal>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Try Expressly.</h2>
        <Link to="/pecs-app" className="mt-9 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">Open Expressly <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </main>
    <Footer />
  </div>
  );
};

export default Index;
