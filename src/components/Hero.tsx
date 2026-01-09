import { Badge } from "@/components/ui/badge";

const Hero = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-4 bg-secondary font-semibold text-white hover:bg-secondary/90">
              Innovation in Communication
            </Badge>
            <h2 className="font-inter font-bold text-3xl md:text-4xl mb-6 text-foreground">
              Beyond Traditional PECS
            </h2>
            <p className="font-inter font-medium text-lg text-muted-foreground mb-8 leading-relaxed">
              Expressly preserves the clinically trusted structure of Picture Exchange Communication Systems
              (PECS) while removing the limitations of static cards. By enabling real-time sentence building
              within clearly defined rules and visual constraints, Expressly helps learners express new ideas
              safely, clearly, and immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              
            </div>
          </div>

          {/* Hero image - slightly zoomed out but larger overall */}
          <div className="w-full flex justify-center">
            <img
              src="/pecs-screenshot.png"
              alt="Smart PECS App"
              className="w-[95%] md:w-[105%] h-auto rounded-2xl shadow-xl object-contain scale-95 md:scale-90"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
