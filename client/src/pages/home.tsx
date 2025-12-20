import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getChapters, getLastRead } from "@/lib/api";
import type { Chapter } from "@shared/schema";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, Clock, Linkedin, Loader2 } from "lucide-react";
import { SettingsMenu } from "@/components/reader/settings-menu";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: chapters = [], isLoading: chaptersLoading } = useQuery({
    queryKey: ["chapters"],
    queryFn: getChapters,
  });

  const { data: lastRead } = useQuery({
    queryKey: ["last-read"],
    queryFn: getLastRead,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const latestChapter = chapters[chapters.length - 1];
  const lastReadChapter = chapters.find((c) => c.id === lastRead?.chapterId);

  if (chaptersLoading) {
    return (
      <Layout>
        <div className="max-w-md mx-auto min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto min-h-screen pb-20 px-6 pt-12 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />

        <header className="mb-12 relative z-10 animate-in fade-in slide-in-from-top-4 duration-700 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-8 bg-primary/50"></div>
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Interactive Novel</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold leading-[0.9] text-foreground mb-4">
              Ananse
            </h1>
            <p className="text-lg font-serif italic text-muted-foreground/80 max-w-xs">
              The Golden Deception
            </p>
          </div>
          <div className="mt-2">
            <SettingsMenu />
          </div>
        </header>

        <main className="flex-1 space-y-8 relative z-10">
          {lastReadChapter ? (
            <div 
              className="group relative bg-card hover:bg-card/80 border border-border/50 rounded-xl p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer"
              onClick={() => setLocation(`/read/${lastReadChapter.slug}`)}
              data-testid="card-resume-reading"
            >
              <div className="absolute top-4 right-4 text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-full">
                RESUME
              </div>
              <p className="text-sm text-muted-foreground mb-1 font-sans">You left off at</p>
              <h3 className="text-xl font-display font-bold mb-3" data-testid="text-last-chapter-title">{lastReadChapter.title}</h3>
              
              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden mb-2">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: "50%" }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground font-sans">
                <span>In progress</span>
                <span className="flex items-center gap-1">
                  Continue <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-8 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-primary mx-auto opacity-80" />
              <h3 className="text-xl font-display font-bold">Begin the Journey</h3>
              <p className="text-sm text-muted-foreground font-serif leading-relaxed">
                Step into the world of Kwaku Ananse, where ancient folklore meets modern mystery.
              </p>
              {chapters.length > 0 && (
                <Button 
                  size="lg" 
                  className="w-full font-sans tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                  onClick={() => setLocation(`/read/${chapters[0].slug}`)}
                  data-testid="button-start-reading"
                >
                  Start Reading
                </Button>
              )}
            </div>
          )}

          {latestChapter && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="flex justify-between items-end border-b border-border pb-2">
                <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">Latest Release</h3>
              </div>
              
              <div 
                onClick={() => setLocation(`/read/${latestChapter.slug}`)}
                className="block group cursor-pointer"
                data-testid="card-latest-chapter"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-display text-lg group-hover:text-primary transition-colors" data-testid="text-latest-chapter-title">
                    {latestChapter.title}
                  </h4>
                  <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
                    NEW
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 font-serif leading-relaxed mb-3">
                  {latestChapter.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-sans">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {latestChapter.readTime} min read
                  </span>
                  <span>
                    {latestChapter.publishedAt ? new Date(latestChapter.publishedAt).toLocaleDateString() : ""}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Link href="/toc">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:border-primary/50 transition-colors" data-testid="button-toc">
                <span className="font-display text-lg">Table of Contents</span>
                <span className="text-xs text-muted-foreground font-normal">View all chapters</span>
              </Button>
            </Link>
            <div className="opacity-50 cursor-not-allowed">
               <Button variant="outline" disabled className="w-full h-auto py-4 flex flex-col gap-2">
                <span className="font-display text-lg">Characters</span>
                <span className="text-xs text-muted-foreground font-normal">Coming Soon</span>
              </Button>
            </div>
          </div>

          <div className="pt-8 mt-12 border-t border-border animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-xl backdrop-blur-sm border border-border/50">
              <div className="relative w-16 h-16 shrink-0">
                <img 
                  src="/author-alfred.png" 
                  alt="Alfred Opare Saforo" 
                  className="w-full h-full object-cover object-top rounded-full border-2 border-primary/20 shadow-sm"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary font-mono uppercase tracking-wider mb-1">Written by</p>
                <h4 className="font-display font-bold text-lg leading-tight truncate">Alfred Opare Saforo</h4>
                <a 
                  href="https://linkedin.com/in/alfred2" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mt-1 transition-colors"
                  data-testid="link-linkedin"
                >
                  <Linkedin className="w-3 h-3" />
                  Connect on LinkedIn
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
