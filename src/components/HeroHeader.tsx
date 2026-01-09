import { Link } from "react-router-dom";

const HeroHeader = () => {
  return (
    <div className="bg-gradient-hero text-white">
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-inter font-bold text-4xl md:text-6xl mb-4">
          Expressly
        </h1>
        <p className="font-inter font-medium text-xl md:text-2xl mb-8 opacity-90">
          Assistive Communication, Without Missed Moments
        </p>
        <p className="font-inter font-medium text-lg max-w-2xl mx-auto leading-relaxed mb-12">
          Expressly is a PECS-aligned assistive communication system designed to support
          nonverbal and minimally verbal individuals when communication matters most.
        </p>

        {/* CTA Button */}
        <Link
          to="/pecs-app"
          className="inline-block bg-white text-primary font-semibold text-lg px-8 py-4 rounded-full shadow-md hover:shadow-lg hover:bg-primary hover:text-white transition-all duration-300 ease-out"
        >
          Go to Expressly App →
        </Link>
      </div>
    </div>
  );
};

export default HeroHeader;
