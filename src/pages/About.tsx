// src/pages/about.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  HeartHandshake,
  Stethoscope,
  Scale,
  Users,
  Workflow,
  Sparkles,
  Tablet,
  Mic,
  Image as ImageIcon,
  Brain,
} from "lucide-react";
import CoreIdea from "@/components/CoreIdea";
import FooterLanding from "@/components/FooterLanding";
import HeaderNav from "@/components/HeaderNav";
import { Link } from "react-router-dom";

const AboutPage = () => {
  const values = [
    {
      title: "Respect for users",
      description: "We design for dignity, not simplification.",
      icon: HeartHandshake,
    },
    {
      title: "Clinical alignment",
      description: "We build within established communication frameworks.",
      icon: Stethoscope,
    },
    {
      title: "Safety over novelty",
      description: "Features are added only when they improve clarity and usability.",
      icon: ShieldCheck,
    },
    {
      title: "Access and equity",
      description: "Communication tools should be affordable and widely deployable.",
      icon: Scale,
    },
  ];

  const practicePoints = [
    { icon: Tablet, text: "Runs on standard tablets already used in classrooms and therapy settings" },
    { icon: Workflow, text: "Preserves PECS sentence structure to minimize retraining" },
    { icon: Mic, text: "Digital sentence strips with spoken output" },
    { icon: ImageIcon, text: "Enables real-time communication without pre-printing or laminating materials" },
    { icon: Users, text: "Supports use across home, school, and therapy environments" },
  ];

  const commitment = [
    "Clinical alignment",
    "Safety over novelty",
    "Respect for users",
    "Access and affordability",
  ];

  return (
    <main className="bg-background pt-16">
      <HeaderNav/>
      {/* HERO */}
      <CoreIdea/>

      {/* PROBLEM */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">The problem we’re addressing</h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Many nonverbal individuals rely on the Picture Exchange Communication System (PECS) to communicate. PECS is
              evidence-based and widely used, but it breaks down when the right picture has not been prepared in advance.
              When communication fails in the moment intent arises, the opportunity to communicate is often lost. This
              creates frustration for learners and places a significant preparation burden on caregivers, educators, and
              therapists. These breakdowns are not caused by lack of effort or ability. They are caused by systems that
              cannot adapt in real time.
            </p>
          </div>

          {/* SIMPLE DIAGRAM: breakdown vs real-time */}
          <div className="mt-10 grid lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-soft">
              <CardContent className="p-8">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-semibold text-foreground">Traditional PECS breakdown</h3>
                  <Badge className="bg-muted text-muted-foreground hover:bg-muted">When a card is missing</Badge>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    "Vocabulary limited to what was prepared",
                    "Manual printing and organization",
                    "Communication breaks when vocabulary is missing",
                  ].map((t) => (
                    <div key={t} className="flex items-start gap-3">
                      <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-muted-foreground/50" />
                      <p className="text-muted-foreground leading-relaxed">{t}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl border border-border bg-background/60 p-4">
                  <div className="text-sm text-muted-foreground">Moment of intent</div>
                  <div className="mt-1 flex items-center gap-2 text-foreground font-semibold">
                    Intent arises <ArrowRight className="h-4 w-4 text-muted-foreground" /> Card missing{" "}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" /> Communication lost
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-medium">
              <CardContent className="p-8">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-semibold text-foreground">Expressly</h3>
                  <Badge className="bg-secondary text-white hover:bg-secondary/90">Real-time continuity</Badge>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    "Real-time visual symbol creation",
                    "Expanding vocabulary within PECS rules",
                    "Digital sentence strips with spoken output",
                    "Communication continues at the moment of intent",
                  ].map((t) => (
                    <div key={t} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-secondary" />
                      <p className="text-muted-foreground leading-relaxed">{t}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl bg-gradient-to-br from-secondary/10 to-primary/10 p-4 border border-secondary/20">
                  <div className="text-sm text-muted-foreground">Moment of intent</div>
                  <div className="mt-1 flex items-center gap-2 text-foreground font-semibold">
                    Intent arises <ArrowRight className="h-4 w-4 text-muted-foreground" /> Build sentence{" "}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" /> Visual + Speech output
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* APPROACH */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our approach</h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Expressly is a PECS-aligned assistive communication system that enables real-time sentence construction
              using visual symbols. Learners select familiar picture cards, build sentences within a structured sentence
              strip, and receive spoken language output.
            </p>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              The system operates through a clinically constrained pipeline: user input → sentence construction logic →
              visual and spoken output → learning insights over time. Vocabulary can be expanded instantly while
              preserving visual consistency, predictability, and cognitive safety.
            </p>
          </div>

          {/* PIPELINE / ARCH DIAGRAM */}
          <div className="mt-10">
            <Card className="border-0 shadow-soft">
              <CardContent className="p-8">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-secondary/10 p-3">
                    <Workflow className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Clinically constrained pipeline</h3>
                    <p className="text-muted-foreground">
                      A predictable workflow that supports safety, clarity, and consistent learning.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid lg:grid-cols-4 gap-4">
                  {[
                    {
                      title: "User input",
                      desc: "Learner selects familiar symbols.",
                      icon: Users,
                    },
                    {
                      title: "Sentence logic",
                      desc: "Rules-based structure aligned to PECS.",
                      icon: Brain,
                    },
                    {
                      title: "Visual + spoken output",
                      desc: "Sentence strip plus speech output.",
                      icon: Mic,
                    },
                    {
                      title: "Learning insights",
                      desc: "Patterns over time support growth.",
                      icon: Sparkles,
                    },
                  ].map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.title} className="relative">
                        <div className="h-full rounded-2xl border border-border bg-background/60 p-5">
                          <div className="flex items-center justify-between">
                            <div className="rounded-xl bg-secondary/10 p-2">
                              <Icon className="h-5 w-5 text-secondary" />
                            </div>
                            <div className="text-xs font-semibold text-muted-foreground">
                              Step {idx + 1}
                            </div>
                          </div>
                          <div className="mt-4 font-semibold text-foreground">{step.title}</div>
                          <div className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.desc}</div>
                        </div>

                        {idx < 3 && (
                          <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 items-center">
                            <div className="h-px w-6 bg-border" />
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our values</h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Expressly is built to be reliable, ethical, and safe. We prioritize clarity and usability over novelty.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <Card key={v.title} className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-7">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-secondary" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-foreground">{v.title}</h3>
                    <p className="mt-2 text-muted-foreground leading-relaxed">{v.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* TEAM + RESEARCH */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-0 shadow-soft">
              <CardContent className="p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">The team</h2>
                    <p className="mt-4 text-muted-foreground leading-relaxed">
                      Expressly was built by a team motivated by firsthand experience with communication breakdowns in
                      educational and therapy settings. We work closely with caregivers, educators, and a board-certified
                      behavioral therapist to ensure Expressly functions safely and effectively in the environments where
                      it is used.
                    </p>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-secondary/10 p-3">
                    <Users className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-soft">
              <CardContent className="p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Research & transparency</h2>
                    <p className="mt-4 text-muted-foreground leading-relaxed">
                      Expressly is grounded in established research on PECS, AAC effectiveness, and communication access.
                      We are committed to transparency, ethical development, and ongoing evaluation as the system is
                      tested and refined.
                    </p>
                  </div>
                  <div className="shrink-0 rounded-2xl bg-secondary/10 p-3">
                    <ShieldCheck className="h-6 w-6 text-secondary" />
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-border bg-background/60 p-5">
                  <div className="text-sm font-semibold text-foreground">What this means in practice</div>
                  <div className="mt-3 space-y-3">
                    {["We validate behavior in real settings.", "We prioritize user safety and clarity.", "We iterate with clinical input."].map(
                      (t) => (
                        <div key={t} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 text-secondary" />
                          <p className="text-muted-foreground leading-relaxed">{t}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* COMMITMENT */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <Card className="border-0 shadow-medium">
            <CardContent className="p-8 md:p-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
                <div className="max-w-3xl">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our commitment</h2>
                  <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                    Expressly is built with a focus on clinical alignment, safety over novelty, respect for users, and
                    access and affordability. We believe communication tools should be reliable, ethical, and designed to
                    serve the people who depend on them every day.
                  </p>

                  <div className="mt-7 grid sm:grid-cols-2 gap-3">
                    {commitment.map((t) => (
                      <div
                        key={t}
                        className="rounded-2xl border border-border bg-background/60 px-4 py-3 flex items-center gap-3"
                      >
                        <CheckCircle2 className="h-5 w-5 text-secondary" />
                        <span className="font-semibold text-foreground">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full lg:w-auto flex flex-col gap-3">
                  <Button asChild className="gap-2">
                    <Link to="/pecs-app">
                      Get started <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/">Back to home</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <FooterLanding/>
    </main>
  );
};

export default AboutPage;
