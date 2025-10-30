import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Badge className="mb-4 bg-secondary font-semibold text-white hover:bg-secondary/90">Innovation in Communication</Badge>
            <h2 className="font-inter font-bold text-3xl md:text-4xl mb-6 text-foreground">
              Beyond Traditional PECS
            </h2>
            <p className="font-inter font-medium text-lg text-muted-foreground mb-8 leading-relaxed">
              Our Expressly platform combines the proven effectiveness of Picture Exchange Communication Systems with
              cutting-edge AI technology. Generate contextual images instantly and build complex sentences that adapt
              to each learner's needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/demo">
                <Button size="lg" className="bg-secondary font-semibold text-white hover:bg-secondary/90">
                  Try the Demo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center h-96">
            <p className="text-gray-500 font-inter font-medium text-lg">Add image later</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;