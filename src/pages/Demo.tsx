import PECSDemo from "@/components/PECSDemo";
import HeaderNav from "@/components/HeaderNav";
import FooterLanding from "@/components/FooterLanding";

const Demo = () => {
  return (
    <div className="min-h-screen">
      <HeaderNav />
      <div className="pt-[73px]">
        <PECSDemo />
        <FooterLanding />
      </div>
    </div>
  );
};

export default Demo;
