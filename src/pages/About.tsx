// src/pages/about.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  ShieldCheck,
  HeartHandshake,
  Stethoscope,
  Scale,
  Users,
  Workflow,
  Tablet,
  Mic,
  Image as ImageIcon,
  Home,
  School,
  Award,
} from "lucide-react";
import Approach from "@/components/Approach";
import CoreIdea from "@/components/CoreIdea";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Problem from "@/components/Problem";
import Team from "@/components/Team";

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

  return (
    <main className="bg-background pt-16">
      <Navbar />
      {/* HERO */}
      <CoreIdea />
      <Problem/>
      <Approach/>

      {/* IN PRACTICE (with real visuals from image 2) */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Expressly in practice</h2>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                Expressly is designed for use in real environments, not controlled demonstrations.
              </p>

              <div className="mt-8 space-y-4">
                {practicePoints.map((p) => {
                  const Icon = p.icon;
                  return (
                    <div key={p.text} className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-xl bg-secondary/10 p-2">
                        <Icon className="h-5 w-5 text-secondary" />
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{p.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <Card className="border-0 shadow-medium overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-foreground">Real-world usage visuals</h3>
                    <Badge className="bg-muted text-muted-foreground hover:bg-muted">Home • School • Therapy</Badge>
                  </div>

                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    These contexts are where communication needs to work immediately: classrooms, kitchens, and therapy
                    spaces.
                  </p>
                </div>

                <div className="px-6 pb-6 md:px-8 md:pb-8">
                {/* 3-up settings gallery */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: "In the Classroom",
                      icon: School,
                      src: "/expressly-classroom.png",
                    },
                    {
                      label: "At Home",
                      icon: Home,
                      src: "/expressly-home.png",
                    },
                    {
                      label: "At Therapy",
                      icon: Stethoscope,
                      src: "/expressly-therapy.png",
                    },
                  ].map((x) => {
                    const Icon = x.icon;

                    return (
                      <div
                        key={x.label}
                        className="rounded-2xl border border-border bg-background/60 overflow-hidden"
                      >
                        {/* Fixed aspect ratio so all three images match height */}
                        <div className="relative w-full aspect-[4/3] bg-muted/30">
                          <img
                            src={x.src}
                            alt={x.label}
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        {/* Label */}
                        <div className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-secondary/10 p-2">
                              <Icon className="h-4 w-4 text-secondary" />
                            </div>
                            <div className="text-sm font-semibold text-foreground">{x.label}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-16 md:py-20">
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
                <Card
                  key={v.title}
                  className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
                >
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
      
      <Team />

      {/* PATENT */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-6">
          <Card className="border-0 shadow-[0_10px_25px_-10px_rgba(0,0,0,0.12),0_-6px_16px_-8px_rgba(0,0,0,0.08)] overflow-hidden">
            <CardContent className="p-8 md:p-10">
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-secondary/10 p-3">
                      <Award className="h-6 w-6 text-secondary" />
                    </div>
                    <Badge className="bg-secondary text-white hover:bg-secondary/90">Milestone</Badge>
                  </div>

                  <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground">
                    Patented innovation
                  </h2>
                  <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                    The Expressly team successfully patented the core idea behind the system. This milestone reflects a
                    long-term commitment to building a reliable, clinically aligned communication tool that can be
                    deployed broadly.
                  </p>

                  <div className="mt-7 grid gap-3">
                    {[
                      "Protects the foundational system design",
                      "Supports long-term product stability and investment",
                      "Signals novelty while preserving clinical alignment",
                    ].map((t) => (
                      <div
                        key={t}
                        className="rounded-2xl border border-border bg-background/60 px-4 py-3 flex items-start gap-3"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-secondary" />
                        <span className="text-muted-foreground leading-relaxed">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="rounded-3xl border border-border bg-gradient-to-br from-secondary/10 to-primary/10 p-4 md:p-6">
                    {/* Patent image */}
                    <div className="relative aspect-[16/10] rounded-2xl border border-border bg-background/60 overflow-hidden">
                      <img
                        src="/expressly-patent.png"
                        alt="Expressly patented milestone illustration"
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="mt-4 rounded-2xl border border-border bg-background/60 p-4">
                      <div className="text-sm font-semibold text-foreground">What this means</div>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        We can continue improving Expressly with confidence, while keeping the interaction model stable
                        and predictable for learners and caregivers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default AboutPage;
