import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Challenge = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Expressly | Congressional App Challenge";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-10">
          <Link to="/challenge" className="flex items-center gap-3" aria-label="Expressly challenge page">
            <img src="/handmade-logo.png" alt="" className="h-10 w-10 rounded-xl object-contain" />
            <span className="text-xl font-semibold tracking-tight">Expressly</span>
          </Link>
          <Link
            to="/pecs-app"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Try the app <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main>
        <section className="overflow-hidden border-b border-border/70">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:px-10 md:py-28 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
                Congressional App Challenge 2026
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-[1.04] tracking-[-0.045em] md:text-7xl">
                A clearer way to say what you need.
              </h1>
              <p className="mt-7 text-lg leading-8 text-muted-foreground md:text-xl">
                Expressly is a student-built communication app for people who communicate more easily with pictures.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/pecs-app"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground"
                >
                  Open Expressly <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href="#our-work"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3.5 font-semibold hover:bg-muted"
                >
                  See what we built
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-10 -z-10 rounded-full bg-secondary/10 blur-3xl" />
              <div className="overflow-hidden rounded-[2rem] border border-border bg-card p-2 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.35)] md:p-3">
                <img
                  src="/pecs-screenshot.png"
                  alt="Expressly showing picture cards and a sentence builder"
                  className="w-full rounded-[1.4rem]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Why we made it</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] md:text-5xl">
                Communication should not depend on finding the perfect words.
              </h2>
            </div>
            <div className="space-y-6 text-lg leading-8 text-muted-foreground">
              <p>
                Some people know what they want to say but need another way to express it. Existing communication tools can feel crowded, difficult to personalize, or overwhelming in the moment.
              </p>
              <p>
                Expressly lets a user choose familiar pictures, place them into a sentence, and share the message visually or aloud. The screen can be adjusted without changing the basic way it works.
              </p>
            </div>
          </div>
        </section>

        <section id="our-work" className="border-y border-border/70 bg-muted/35">
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">What the app does</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] md:text-5xl">
                Built for real communication moments.
              </h2>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3">
              <article className="bg-background p-8 md:p-10">
                <p className="font-mono text-sm text-muted-foreground">01</p>
                <h3 className="mt-10 text-2xl font-semibold">Choose</h3>
                <p className="mt-3 leading-7 text-muted-foreground">
                  Find a picture for a person, feeling, action, place, or object.
                </p>
              </article>
              <article className="bg-background p-8 md:p-10">
                <p className="font-mono text-sm text-muted-foreground">02</p>
                <h3 className="mt-10 text-2xl font-semibold">Build</h3>
                <p className="mt-3 leading-7 text-muted-foreground">
                  Put the pictures together and turn them into a clear sentence.
                </p>
              </article>
              <article className="bg-background p-8 md:p-10">
                <p className="font-mono text-sm text-muted-foreground">03</p>
                <h3 className="mt-10 text-2xl font-semibold">Share</h3>
                <p className="mt-3 leading-7 text-muted-foreground">
                  Show the message or play it aloud when the user is ready.
                </p>
              </article>
            </div>

            <div className="mt-12 grid gap-8 rounded-3xl bg-primary px-7 py-10 text-primary-foreground md:grid-cols-3 md:px-10">
              <div>
                <h3 className="font-semibold">Made to adjust</h3>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/75">
                  Vocabulary levels, card sizes, themes, text sizes, languages, and calm mode help families shape the app around the learner.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Support for caregivers</h3>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/75">
                  Parents can personalize cards and review communication progress without crowding the learner’s screen.
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Built with code</h3>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/75">
                  We built Expressly with React, TypeScript, Supabase, and secure server tools for grammar, voice, and image creation.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:px-10 md:py-28 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <img
              src="/expressly-team.png"
              alt="The four student founders of Expressly"
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Our team</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] md:text-5xl">Four students, one shared goal.</h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              We started Expressly as a student project and kept improving it through research, competitions, coding, feedback, and a lot of testing. We want communication support to feel personal, respectful, and easier to use.
            </p>
          </div>
        </section>

        <section className="border-t border-border/70 bg-muted/35">
          <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-24">
            <h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">Try building a message.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Open Expressly, choose a few cards, and see how quickly a thought can become something another person understands.
            </p>
            <Link
              to="/pecs-app"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 font-semibold text-primary-foreground"
            >
              Open Expressly <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10">
          <span>Expressly · Student-built accessible communication</span>
          <div className="flex flex-wrap gap-5">
            <Link to="/about" className="hover:text-foreground">About the project</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/pecs-app" className="hover:text-foreground">Open app</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Challenge;
