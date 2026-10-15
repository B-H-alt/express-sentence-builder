import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { SUPPORT_EMAIL } from "@/lib/support";

const questions = [
  {
    title: "I can't hear anything",
    text: "Check your device volume and sound output first. Then open your learner profile, choose Profile & settings, and check Volume in Cards & voice. If enhanced voice is unavailable, Expressly tries the device voice. An offline device needs an installed voice for the chosen language.",
  },
  {
    title: "I can't sign in or verify my email",
    text: "Check the email address you entered and look in your spam folder for the confirmation message. Use Forgot password on the sign-in screen if you need a reset link. If you've requested several emails, wait before trying again. You can still open the communication board without an account.",
  },
  {
    title: "What works without internet?",
    text: "You can build and show messages with built-in cards, use basic English grammar, and speak with an available device voice. The installed iPad app includes its built-in cards. On the website, open Expressly online first and allow the initial download to finish. Browser storage can be cleared or removed by the device, so check offline access before relying on it. New generated images, enhanced voice, online grammar, and account actions need internet.",
  },
  {
    title: "How do I make the screen easier to use?",
    text: "Open Profile & settings, then Display. Choose larger cards, larger text, a different theme, or Calm mode. Larger cards show fewer choices at once. These settings can be changed again whenever you need.",
  },
  {
    title: "How do I keep a copy of my cards and settings?",
    text: "Use the data download option in your parent account before changing devices or clearing app data. Many learner settings, custom cards, and progress records currently stay on the device. Signing in does not automatically copy them to another device. Account deletion is also available in your parent account.",
  },
];

const Support = () => (
  <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
        <Link to="/" aria-label="Expressly home" className="flex items-center gap-3 font-semibold">
          <img src="/handmade-logo.png" alt="" className="h-9 w-9 object-contain" />Expressly
        </Link>
        <Link to="/pecs-app" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Open Expressly</Link>
      </div>
    </header>
    <main className="mx-auto max-w-3xl px-6 py-12 md:py-16">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Help & Support</h1>
      <p className="mt-4 text-lg text-muted-foreground">A little help getting your message across.</p>

      <section aria-labelledby="start-heading" className="mt-10 border-b border-border pb-10">
        <h2 id="start-heading" className="text-xl font-semibold">Start with three steps</h2>
        <ol className="mt-5 list-decimal space-y-4 pl-5 leading-7 text-muted-foreground">
          <li><span className="font-medium text-foreground">Find a card.</span> Choose a category or use Find a card.</li>
          <li><span className="font-medium text-foreground">Tap to build.</span> Your cards appear in the sentence area. Tap a card's remove button if you change your mind.</li>
          <li><span className="font-medium text-foreground">Speak or show.</span> Tap Speak to read your message, or show the cards to someone. Finish saves the message without speaking.</li>
        </ol>
        <p className="mt-5 text-sm leading-6 text-muted-foreground">For a guided walkthrough, open the app and choose How to use Expressly in the sentence area. On smaller screens, it says How it works.</p>
      </section>

      <section aria-labelledby="questions-heading" className="mt-10">
        <h2 id="questions-heading" className="text-xl font-semibold">Something not working?</h2>
        <div className="mt-4 divide-y divide-border">
          {questions.map((question) => (
            <details key={question.title} className="group py-1">
              <summary className="min-h-12 cursor-pointer rounded-md py-4 pr-3 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{question.title}</summary>
              <p className="pb-5 text-sm leading-7 text-muted-foreground">{question.text}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="contact-heading" className="mt-10 rounded-xl border border-border p-6">
        <h2 id="contact-heading" className="text-xl font-semibold">Contact Expressly</h2>
        <p className="mt-3 leading-7 text-muted-foreground">Tell us what happened and which device you're using. Please don't include passwords, payment details, or private information about a learner.</p>
        <a className="mt-4 inline-block min-h-11 break-all py-2 font-medium text-primary underline underline-offset-4" href={`mailto:${SUPPORT_EMAIL}?subject=Expressly%20support`}>{SUPPORT_EMAIL}</a>
        <p className="mt-1 text-sm text-muted-foreground">The link opens your email app. Nothing is sent until you send the email.</p>
      </section>
    </main>
    <Footer />
  </div>
);

export default Support;
