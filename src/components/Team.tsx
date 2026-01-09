import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, Users } from "lucide-react";

const Team = () => {
  return (
    <section className="py-16 md:py-20 bg-[#E3F4F8]">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Team Card */}
          <Card className="border-0 shadow-soft">
            <CardContent className="p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    The Team
                  </h2>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Expressly was built by a team motivated by firsthand experience with
                    communication breakdowns in educational and therapy settings. We work
                    closely with caregivers, educators, and a board-certified behavioral
                    therapist to ensure Expressly functions safely and effectively in the
                    environments where it is used.
                  </p>
                </div>
                <div className="shrink-0 rounded-2xl bg-secondary/10 p-3">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="overflow-hidden rounded-2xl border border-border aspect-[5/4]">
                  <img
                    src="/expressly-team.png"
                    alt="Expressly team"
                    className="h-full w-full object-cover object-[45%_0%]"
                  />
                </div>

                <div className="overflow-hidden rounded-2xl border border-border aspect-[5/4]">
                  <img
                    src="/smartpecs-team.webp"
                    alt="Smart PECS team"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Research Card */}
          <Card className="border-0 shadow-soft">
            <CardContent className="p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Research & Transparency
                  </h2>
                  <p className="mt-4 text-[15px] md:text-base text-muted-foreground leading-relaxed">
                    Expressly is grounded in established research on PECS, AAC effectiveness,
                    and communication access. We are committed to transparency, ethical
                    development, and ongoing evaluation as the system is tested and refined.
                  </p>
                </div>
                <div className="shrink-0 rounded-2xl bg-secondary/10 p-3">
                  <ShieldCheck className="h-6 w-6 text-secondary" />
                </div>
              </div>

              {/* INNER CARD — bumped again */}
              <div className="mt-10 rounded-2xl border border-border bg-background/60 p-7">
                <div className="text-base md:text-lg font-semibold text-foreground">
                  What this means in practice
                </div>

                <div className="mt-6 space-y-5">
                  {[
                    "We validate behavior in real settings.",
                    "We prioritize user safety and clarity.",
                    "We iterate with clinical input.",
                  ].map((t) => (
                    <div key={t} className="flex items-start gap-4">
                      <CheckCircle2 className="mt-1 h-5 w-5 text-secondary" />
                      <p className="text-[15px] md:text-base text-muted-foreground leading-relaxed">
                        {t}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Team;
