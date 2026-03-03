import { Zap, Brain, ImageIcon, MessageSquare } from "lucide-react";

const About = () => {
  return (
    <section className="py-20 px-4 bg-secondary-light">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="font-inter font-bold text-3xl md:text-5xl mb-6">What Makes Expressly Different?</h2>
          <p className="font-inter font-medium text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Building on the proven foundation of traditional PECS, Smart PECS leverages artificial intelligence to
            create a more dynamic and responsive communication experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-white rounded-2xl p-8 shadow-soft">
            <h3 className="font-inter font-bold text-2xl md:text-3xl mb-6">Traditional PECS</h3>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                <span className="font-inter font-medium text-base">Static picture cards</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                <span className="font-inter font-medium text-base">Limited vocabulary sets</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                <span className="font-inter font-medium text-base">Manual card management</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                <span className="font-inter font-medium text-base">Communication easily breaks</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl p-8 shadow-medium border-2 border-secondary/20">
            <h3 className="font-inter font-bold text-2xl md:text-3xl mb-6 text-primary">Smart PECS</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-secondary mt-1 flex-shrink-0" />
                <span className="font-inter font-medium text-base text-foreground">Real-time visual symbol creation</span>
              </li>
              <li className="flex items-start gap-3">
                <Brain className="w-6 h-6 text-secondary mt-1 flex-shrink-0" />
                <span className="font-inter font-medium text-base text-foreground">Expanding vocabulary within PECS rules</span>
              </li>
              <li className="flex items-start gap-3">
                <ImageIcon className="w-6 h-6 text-secondary mt-1 flex-shrink-0" />
                <span className="font-inter font-medium text-base text-foreground">Digital sentence strips with spoken output</span>
              </li>
              <li className="flex items-start gap-3">
                <MessageSquare className="w-6 h-6 text-secondary mt-1 flex-shrink-0" />
                <span className="font-inter font-medium text-base text-foreground">Communication continues smoothly</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;