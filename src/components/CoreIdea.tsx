import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";

const CoreIdea = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto max-w-8xl px-4 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-4 bg-secondary font-semibold text-white hover:bg-secondary/90">
              About Expressly
            </Badge>

            <h1 className="font-inter font-bold text-3xl md:text-5xl text-foreground leading-tight">
              Communication should not fail when it matters most.
            </h1>

            <p className="mt-6 font-inter font-medium text-lg text-muted-foreground leading-relaxed">
              Expressly exists to ensure that communication does not fail when it matters most. We built an assistive
              communication system for nonverbal and minimally verbal individuals who rely on visual language. Expressly
              is designed to preserve clinically trusted PECS workflows while removing the barriers that prevent
              real-time, spontaneous expression in daily life.
            </p>
          </div>

          <div className="w-full">
            <Card className="border-0 shadow-soft">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-muted-foreground">Core idea</div>
                    <div className="mt-1 text-xl md:text-2xl font-bold text-foreground">
                      PECS-aligned, real-time expression
                    </div>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                      Learners select familiar picture cards, build sentences in a structured strip, and receive spoken
                      output. Vocabulary can expand instantly while preserving predictability and cognitive safety.
                    </p>
                  </div>

                  <div className="shrink-0 rounded-2xl bg-secondary/10 p-3">
                    <Brain className="h-6 w-6 text-secondary" />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <div className="text-xs text-muted-foreground">Workflow</div>
                    <div className="mt-1 font-semibold text-foreground">PECS-aligned</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <div className="text-xs text-muted-foreground">Output</div>
                    <div className="mt-1 font-semibold text-foreground">Visual + Speech</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-background/60 p-4">
                    <div className="text-xs text-muted-foreground">Focus</div>
                    <div className="mt-1 font-semibold text-foreground">Safety + Usability</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoreIdea;
