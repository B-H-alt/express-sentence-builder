import PECSDemo from "@/components/PECSDemo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Demo = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-[73px]">
        <PECSDemo />
        <Footer />
      </div>
    </div>
  );
};

export default Demo;
