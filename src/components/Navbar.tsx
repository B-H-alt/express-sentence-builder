import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-10">
        <Link to="/" className="flex items-center gap-3" aria-label="Expressly home">
          <img src="/handmade-logo.png" alt="" className="h-10 w-10 rounded-xl object-contain" />
          <span className="text-xl font-semibold tracking-tight">Expressly</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">How it works</a>
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">Features</a>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground">About</Link>
          <Link to="/pecs-app?account=sign-in" className="text-sm font-medium text-muted-foreground hover:text-foreground">Sign in</Link>
          <Link to="/pecs-app" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Open app</Link>
        </div>
        <button type="button" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)} className="rounded-xl border border-border p-2 md:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-border bg-background px-6 py-5 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            <a href="#how-it-works" onClick={() => setOpen(false)} className="font-medium">How it works</a>
            <a href="#features" onClick={() => setOpen(false)} className="font-medium">Features</a>
            <Link to="/about" onClick={() => setOpen(false)} className="font-medium">About</Link>
            <Link to="/pecs-app?account=sign-in" onClick={() => setOpen(false)} className="font-medium">Sign in</Link>
            <Link to="/pecs-app" onClick={() => setOpen(false)} className="mt-1 rounded-full bg-primary px-5 py-3 text-center font-semibold text-primary-foreground">Open app</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
