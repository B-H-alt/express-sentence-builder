import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const Problem = () => {
  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            When you need another card
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Printed picture cards take time to prepare and organize. Expressly lets you add a photo or create a new
            picture card in the app, then use it alongside the included vocabulary.
          </p>
        </div>

        {/* SIMPLE DIAGRAM: breakdown vs real-time */}
        <div className="mt-10 grid lg:grid-cols-[1fr_1.05fr] gap-8">
          {/* Traditional PECS (de-emphasized) */}
          <Card className="border border-border/60 shadow-soft bg-background/80">
            <CardContent className="p-8 opacity-90">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-foreground">
                  Traditional PECS breakdown
                </h3>
                <Badge className="bg-muted text-muted-foreground">
                  When a card is missing
                </Badge>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  "Vocabulary limited to what was prepared",
                  "Manual printing and organization",
                  "New words need new cards",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-3">
                    <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                    <p className="text-muted-foreground leading-relaxed">{t}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-4">
                <div className="text-sm text-muted-foreground">
                  Adding a word
                </div>
                <div className="mt-1 flex items-center gap-2 text-foreground font-semibold">
                  Need a word
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  Card missing
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  Prepare a card
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expressly (dominant / solution) */}
          <Card className="relative border-0 bg-background shadow-xl sm:scale-[1.03]">
            {/* subtle highlight ring */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-secondary/20" />

            <CardContent className="p-8">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-foreground">
                  Expressly
                </h3>
                <Badge className="bg-secondary text-white shadow-sm">
                  Digital cards
                </Badge>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  "Create a picture or upload a photo",
                  "Add words to the included vocabulary",
                  "Digital sentence strips with spoken output",
                  "Use new cards on the same board",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-secondary" />
                    <p className="text-muted-foreground leading-relaxed">
                      {t}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-gradient-to-br from-secondary/15 to-primary/15 p-4 border border-secondary/30">
                <div className="text-sm text-muted-foreground">
                  Using a card
                </div>
                <div className="mt-1 flex items-center gap-2 text-foreground font-semibold">
                  Choose cards
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  Build sentence
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  Visual + Speech output
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Problem;
