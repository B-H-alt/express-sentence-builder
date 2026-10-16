import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Brain, Mic, Sparkles, Users, Workflow } from "lucide-react";

const Approach = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-[#E3F4F8] to-[#CEE6EE]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our approach</h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Cards are grouped into categories. Tap a card to add it to a sentence, then choose whether to play it aloud.
          </p>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            You can add cards for words that are missing and adjust the board in Settings.
          </p>
        </div>

        <div className="mt-10">
          <Card className="border-0 shadow-soft bg-background/60">
            <CardContent className="p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-secondary/10 p-3">
                  <Workflow className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Using the board</h3>
                  <p className="text-muted-foreground">
                    Choose words, put them together, and share your message.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid lg:grid-cols-4 gap-4">
                {[
                  { title: "Choose cards", desc: "Browse categories or search for a word.", icon: Users },
                  { title: "Build a sentence", desc: "Tap cards in the order you want.", icon: Brain },
                  { title: "Speak", desc: "Play the sentence aloud.", icon: Mic },
                  { title: "Review activity", desc: "View recorded activity in Parent Mode.", icon: Sparkles },
                ].map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="relative">
                      <div className="h-full rounded-2xl border border-border bg-background/60 p-5">
                        <div className="flex items-center justify-between">
                          <div className="rounded-xl bg-secondary/10 p-2">
                            <Icon className="h-5 w-5 text-secondary" />
                          </div>
                          <div className="text-xs font-semibold text-muted-foreground">Step {idx + 1}</div>
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

        {/* ARCHITECTURE GRAPH */}
        <div className="mt-10">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <div className="rounded-3xl border border-border bg-secondary/5 overflow-hidden">
                <img
                  src="/expressly-architecture.png"
                  alt="Expressly system architecture diagram"
                  className="w-full h-auto block"
                  loading="lazy"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Approach;
