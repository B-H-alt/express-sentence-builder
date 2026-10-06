import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-muted/30">
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">
      <div className="flex items-center gap-3">
        <img src="/handmade-logo.png" alt="" className="h-9 w-9 rounded-lg object-contain" />
        <div>
          <p className="font-semibold">Expressly</p>
          <p className="text-sm text-muted-foreground">Picture-based communication, made simpler.</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
        <Link to="/about" className="hover:text-foreground">About</Link>
        <Link to="/pecs-app" className="hover:text-foreground">Open app</Link>
        <a href="https://www.linkedin.com/in/expressly-company-415b10390/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">LinkedIn</a>
        <span>© 2026 Expressly</span>
      </div>
    </div>
  </footer>
);

export default Footer;
