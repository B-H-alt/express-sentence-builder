import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-gradient-hero text-white">
      {/* Navigation Bar */}
      <nav className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/handmade-logo.png" alt="Expressly Logo" className="h-10 w-auto" />
            <span className="font-inter font-bold text-xl">Expressly</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="font-inter font-medium hover:text-white/80 transition-colors">
              Home
            </Link>
            <Link to="/demo" className="font-inter font-medium hover:text-white/80 transition-colors">
              Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Header Content */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-inter font-bold text-4xl md:text-6xl mb-4">Expressly</h1>
        <p className="font-inter font-medium text-xl md:text-2xl mb-8 opacity-90">AI-Enhanced Picture Exchange Communication System</p>
        <p className="font-inter font-medium text-lg max-w-2xl mx-auto leading-relaxed">
          Revolutionizing traditional PECS with artificial intelligence to generate dynamic images and create
          meaningful sentences for enhanced communication and learning.
        </p>
      </div>
    </header>
  );
};

export default Header;