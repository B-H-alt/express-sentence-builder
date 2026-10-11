import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface LegalSection {
  title: string;
  content: ReactNode;
}

interface LegalPageProps {
  title: string;
  summary: string;
  sections: LegalSection[];
}

export const LegalPage = ({ title, summary, sections }: LegalPageProps) => (
  <main className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-3 font-semibold" aria-label="Expressly home">
          <img src="/handmade-logo.png" alt="" className="h-9 w-9 rounded-lg object-contain" />
          Expressly
        </Link>
        <Link to="/pecs-app" className="text-sm font-medium text-primary hover:underline">
          Open app
        </Link>
      </div>
    </header>

    <article className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <div className="rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100">
        Draft for review. This page must be reviewed before Expressly begins accepting paid customers.
      </div>
      <p className="mt-8 text-sm font-medium text-muted-foreground">Last updated October 11, 2026</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{summary}</p>

      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
            <div className="mt-3 space-y-3 leading-7 text-muted-foreground">{section.content}</div>
          </section>
        ))}
      </div>

      <div className="mt-14 flex flex-wrap gap-5 border-t border-border pt-6 text-sm">
        <Link to="/privacy" className="font-medium text-primary hover:underline">Privacy Policy</Link>
        <Link to="/terms" className="font-medium text-primary hover:underline">Terms of Use</Link>
        <Link to="/" className="font-medium text-primary hover:underline">Return home</Link>
      </div>
    </article>
  </main>
);

