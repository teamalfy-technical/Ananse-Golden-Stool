import { useEffect } from "react";
import { useSettings } from "@/lib/store";
import { Toaster } from "@/components/ui/toaster";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, fontSize } = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "sepia");
    root.classList.add(theme);
    
    // Set font size variable
    root.style.setProperty("--font-size-multiplier", `${fontSize / 100}`);
  }, [theme, fontSize]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 font-serif">
      {children}
      <Toaster />
    </div>
  );
}
