import Navbar from "@/components/Navbar";
import HeroHeader from "@/components/HeroHeader";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const commitment = ["Clinical alignment", "Safety over novelty", "Respect for users", "Access and affordability"];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-[73px]">
        <HeroHeader />
        <Hero />
        <About />
        <Features />

        {/* TESTIMONIAL */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <Card className="border border-border/60 shadow-soft">
              <CardContent className="p-8 md:p-10">
                <div className="grid lg:grid-cols-[1fr_280px] gap-10 items-center">
                  {/* Quote */}
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                      Trusted by clinical professionals
                    </h3>
                    <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                      “As a BCBA working with students across the autism spectrum, Expressly has completely transformed my
                      practice. The ability to create and customize PECS cards for each student's unique needs, combined
                      with the built-in grammar check and comprehensive progression from beginner to advanced levels,
                      makes this far more versatile than traditional static card systems.
                    </p>
                    <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                      The real-time data tracking finally gives me the insights I need to adjust interventions
                      immediately; this is the innovative tool that bridges the gap between evidence-based practice and
                      modern technology.”
                    </p>
                  </div>

                  {/* Image */}
                  <div className="flex flex-col items-center lg:items-end">
                    <div className="rounded-2xl border border-border overflow-hidden bg-background">
                      <img
                        src="/expressly-professional.webp"
                        alt="Hwee Lan, Board Certified Behavior Analyst"
                        className="h-64 w-64 object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="mt-4 text-center lg:text-right">
                      <div className="font-semibold text-foreground">Hwee Lan Tan</div>
                      <div className="text-sm text-muted-foreground">
                        Board Certified Behavior Analyst (BCBA)
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* COMMITMENT */}
        <section className="relative pt-20 pb-28 bg-gradient-to-b from-secondary-light to-background">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground">
                Our commitment
              </h2>

              <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
                Expressly is built with a focus on clinical alignment, safety over novelty,
                respect for users, and access and affordability. We believe communication
                tools should be reliable, ethical, and designed to serve the people who
                depend on them every day.
              </p>

              {/* Commitment pills */}
              <div className="mt-10 grid sm:grid-cols-2 gap-4 text-left">
                {commitment.map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-background/80 backdrop-blur px-5 py-4 shadow-soft"
                  >
                    <CheckCircle2 className="h-5 w-5 text-secondary shrink-0" />
                    <span className="font-semibold text-foreground">
                      {t}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="bg-secondary gap-2 px-8">
                  <Link to="/pecs-app">
                    Get started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-border/80 hover:border-border px-8"
                >
                  <Link to="/">Back to home</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default Index;
