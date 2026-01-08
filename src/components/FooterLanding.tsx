const FooterLanding = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center space-y-8">
          {/* Slogan */}
          <div className="text-center mb-4">
            <p className="font-inter font-light italic text-xl md:text-2xl text-white/90 tracking-wide">
              "Express Yourself"
            </p>
          </div>

          <div className="flex gap-6">
            <a href="#" className="text-2xl hover:text-secondary transition-colors">📘</a>
            <a href="#" className="text-2xl hover:text-secondary transition-colors">🐦</a>
            <a href="#" className="text-2xl hover:text-secondary transition-colors">📷</a>
            <a href="#" className="text-2xl hover:text-secondary transition-colors">💼</a>
          </div>
          
          <div className="text-center">
            <p className="font-inter text-background/60 text-sm">&copy; 2025 Expressly. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterLanding;