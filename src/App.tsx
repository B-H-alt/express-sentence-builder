import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import { Capacitor } from "@capacitor/core";
import { AppLoadingScreen, AppWelcomePreview, NativeAppEntry } from "@/components/AppWelcome";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";

import { useDeviceProfile } from "./hooks/useDeviceProfile";

const Index = lazy(() => import("./pages/Index"));
const PecsApp = lazy(() => import("./pages/PecsApp"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Support = lazy(() => import("./pages/Support"));
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
          <AppErrorBoundary><Suspense fallback={<AppLoadingScreen />}>
            <Routes>
              <Route path="/" element={Capacitor.isNativePlatform() ? <NativeAppEntry><PecsApp /></NativeAppEntry> : <Index />} />
              <Route path="/pecs-app" element={Capacitor.isNativePlatform() ? <NativeAppEntry><PecsApp /></NativeAppEntry> : <PecsApp />} />
              <Route path="/welcome" element={<AppWelcomePreview />} />
              <Route path="/parent" element={<ParentDashboard />} />
              <Route path="/caregiver" element={<ParentDashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/support" element={<Support />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense></AppErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
