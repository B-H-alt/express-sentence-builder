import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Features = () => {
  const features = [
    {
      icon: "📱",
      title: "Digital PECS Platform",
      description: "Modern, intuitive app that brings PECS into the digital age with interactive features and progress tracking.",
      color: "feature-red"
    },
    {
      icon: "🎨",
      title: "Customizable Picture Library",
      description: "Thousands of high-quality symbols and the ability to add personalized photos for maximum relevance.",
      color: "feature-blue"
    },
    {
      icon: "📊",
      title: "Progress Analytics",
      description: "Detailed insights and reports to track your child's communication development over time.",
      color: "feature-teal"
    },
    {
      icon: "👥",
      title: "Family & Educator Portal",
      description: "Collaborative platform connecting parents, teachers, and therapists for consistent support.",
      color: "feature-red"
    },
    {
      icon: "🔧",
      title: "Adaptive Learning",
      description: "AI-powered personalization that adjusts to your child's learning pace and preferences.",
      color: "feature-blue"
    },
    {
      icon: "🏥",
      title: "Clinical Support",
      description: "Access to certified PECS professionals and ongoing guidance throughout your journey.",
      color: "feature-teal"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            How Expressly Transforms PECS
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We've reimagined traditional PECS for the digital era, making it more accessible, 
            engaging, and effective for today's families.
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