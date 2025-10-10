import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Communication Made Simple</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Expressly PECS
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Empowering communication through visual cards. Build sentences naturally with our intuitive, accessible interface designed for everyone.
          </p>
          
          <Link to="/pecs-app">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <MessageSquare className="w-6 h-6 mr-2" />
              Open PECS App
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card p-8 rounded-3xl shadow-lg border border-border/50 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Tap or Drag</h3>
            <p className="text-muted-foreground">
              Choose your preferred way to build sentences - simple tap to add or intuitive drag and drop
            </p>
          </div>

          <div className="bg-card p-8 rounded-3xl shadow-lg border border-border/50 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Favorites</h3>
            <p className="text-muted-foreground">
              Mark frequently used cards as favorites and get personalized suggestions based on usage
            </p>
          </div>

          <div className="bg-card p-8 rounded-3xl shadow-lg border border-border/50 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
              <Zap className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3">Pictures & Words</h3>
            <p className="text-muted-foreground">
              Toggle between visual pictures and text words to match learning styles and preferences
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
