import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SplashScreen } from "@/components/splash-screen";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import TOC from "@/pages/toc";
import ChapterPage from "@/pages/chapter";
import AdminPage from "@/pages/admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/toc" component={TOC} />
      <Route path="/read/:slug" component={ChapterPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [location] = useLocation();

  useEffect(() => {
    // Only show splash on the home page
    if (location !== "/") {
      setShowSplash(false);
      return;
    }

    // Check if we've already shown splash this session
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    if (hasSeenSplash) {
      setShowSplash(false);
      return;
    }

    // Show splash for 3.5 seconds, then fade out
    const timer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem("hasSeenSplash", "true");
    }, 3500);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SplashScreen isVisible={showSplash && location === "/"} />
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
