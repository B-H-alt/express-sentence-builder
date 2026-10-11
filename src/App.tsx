import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";

import { useDeviceProfile } from "./hooks/useDeviceProfile";

const Index = lazy(() => import("./pages/Index"));
const PecsApp = lazy(() => import("./pages/PecsApp"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ParentDashboard = lazy(() =>
  import("./components/pecs/ParentDashboard").then((module) => ({ default: module.ParentDashboard }))
);

const queryClient = new QueryClient();

const App = () => {
  useDeviceProfile();

  return (
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
          <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-sm font-medium text-muted-foreground">Loading Expressly…</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pecs-app" element={<PecsApp />} />
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
