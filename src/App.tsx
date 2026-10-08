import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

import Index from "./pages/Index";
import PecsApp from "./pages/PecsApp";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { ParentDashboard } from "./components/pecs/ParentDashboard";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider
    attribute="class"
    defaultTheme="light"
    enableSystem={false}
    storageKey="expressly-theme"
    themes={["light", "dark", "warm", "warm-dark", "sage", "sage-dark", "lavender", "lavender-dark", "rose", "rose-dark"]}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pecs-app" element={<PecsApp />} />
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
