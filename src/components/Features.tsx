import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Features = () => {
  const features = [
    {
      icon: "📱",
      title: "Digital PECS Platform",
      description: "A structured, tablet-based PECS interface designed for clarity, predictability, and ease of use",
      color: "feature-red"
    },
    {
      icon: "🎨",
      title: "Custom Vocabulary Within Structure",
      description: "Create and upload personalized symbols while preserving PECS-aligned sentence frameworks and visual consistency",
      color: "feature-blue"
    },
    {
      icon: "🧩",
      title: "Sentence Construction Logic",
      description: "Build multi-symbol phrases and sentences using rule-based construction that prevents cognitive overload",
      color: "feature-teal"
    },
    {
      icon: "🗣",
      title: "Family & Educator Portal",
      description: "Communicate using pictures alone or with spoken language output, supporting multiple ability levels",
      color: "feature-red"
    },
    {
      icon: "📈",
      title: "Adaptive Learning",
      description: "Track vocabulary usage and sentence patterns to support progression from single words to longer phrases",
      color: "feature-blue"
    },
    {
      icon: "👥",
      title: "Clinical Support",
      description: "Designed for consistent use across home, school, and therapy without recreating materials",
      color: "feature-teal"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            How Expressly Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Expressly operates as a clinically constrained communication system rather than an open-ended
            app.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6`} style={{ backgroundColor: `hsl(var(--${feature.color}))` }}>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;