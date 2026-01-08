import HeaderNav from "@/components/HeaderNav";
import HeroHeader from "@/components/HeroHeader";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import FooterLanding from "@/components/FooterLanding";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeaderNav />
      <div className="pt-[73px]">
        <HeroHeader />
        <Hero />
        <About />
        <Features />
        <FooterLanding />
      </div>
    </div>
  );
};

export default Index;
