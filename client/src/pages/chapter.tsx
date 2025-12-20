import { useEffect, useRef, useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import ReactMarkdown from "react-markdown";
import { useProgress, useSettings } from "@/lib/store";
import { CHAPTERS, getChapter, type Chapter } from "@/lib/mockData";
import Layout from "@/components/layout";
import { SettingsMenu } from "@/components/reader/settings-menu";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Menu, Share2, MoreHorizontal, Heart, MessageCircle, Flame, Meh } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ChapterPage() {
  const [match, params] = useRoute("/read/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug;
  
  const { markChapterAsRead, setLastReadChapter, setChapterProgress, chapterProgress, readChapters } = useProgress();
  const { fontSize } = useSettings();
  
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [restoredScroll, setRestoredScroll] = useState(false);
  const [liked, setLiked] = useState(false);
  
  const lastScrollY = useRef(0);

  // Scroll Progress for bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Load Chapter
  useEffect(() => {
    if (slug) {
      setLoading(true);
      const found = CHAPTERS.find((c: Chapter) => c.slug === slug);
      if (found) {
        setChapter(found);
        setLastReadChapter(found.id);
        setRestoredScroll(false); 
      }
      setLoading(false);
    }
  }, [slug]);

  // Restore Scroll Position
  useEffect(() => {
    if (chapter && !loading && !restoredScroll) {
      const savedProgress = chapterProgress[chapter.id];
      if (savedProgress && savedProgress > 0 && savedProgress < 1) {
        // Small delay to ensure content is rendered
        setTimeout(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({
            top: totalHeight * savedProgress,
            behavior: "instant"
          });
        }, 100);
      } else {
        window.scrollTo(0, 0);
      }
      setRestoredScroll(true);
    }
  }, [chapter, loading, restoredScroll, chapterProgress]);

  // Handle Scroll (Hide/Show UI & Save Progress)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Toggle UI
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowControls(false);
      } else {
        setShowControls(true);
      }
      lastScrollY.current = currentScrollY;

      // Save Progress
      if (chapter && totalHeight > 0) {
        const progress = currentScrollY / totalHeight;
        // Only update if changed significantly to avoid thrashing
        setChapterProgress(chapter.id, progress);
        
        if (progress > 0.95) {
          markChapterAsRead(chapter.id);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [chapter]);

  if (loading || !chapter) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground font-serif">Loading story...</div>
        </div>
      </Layout>
    );
  }

  const nextChapter = CHAPTERS.find((c: Chapter) => c.order === chapter.order + 1);
  const prevChapter = CHAPTERS.find((c: Chapter) => c.order === chapter.order - 1);

  return (
    <Layout>
      {/* Reading Progress Bar (Top) */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
        style={{ scaleX }}
      />

      {/* Top Navigation Bar */}
      <div 
        className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 bg-background/95 backdrop-blur-sm border-b border-border/50 ${
          showControls ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="icon" className="-ml-2">
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
          </Link>
          
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground truncate max-w-[150px]">
            {chapter.title}
          </span>

          <div className="flex items-center gap-1">
             <SettingsMenu />
             <Link href="/toc">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5 text-muted-foreground" />
                </Button>
             </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <article className="max-w-2xl mx-auto px-6 pt-24 pb-32 min-h-screen">
        <header className="mb-12 text-center">
          <span className="text-xs font-mono text-primary uppercase tracking-widest mb-4 block">
            Chapter {chapter.order}
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6 leading-tight">
            {chapter.title.split(": ")[1] || chapter.title}
          </h1>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-sans">
            <span>{new Date(chapter.publishedAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{chapter.readTime} min read</span>
          </div>
        </header>

        <div 
          className="prose prose-lg mx-auto"
          style={{ fontSize: `calc(1.125rem * ${fontSize / 100})` }}
        >
          <ReactMarkdown
             components={{
                p: ({node, ...props}) => <p className="mb-6 font-serif leading-loose text-foreground/90" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
                em: ({node, ...props}) => <em className="italic text-foreground/80" {...props} />,
             }}
          >
            {chapter.content}
          </ReactMarkdown>
        </div>

        {/* Reactions Section */}
        <div className="mt-16 mb-12 flex justify-center">
            <div className="flex items-center gap-2 p-1.5 bg-secondary/30 rounded-full border border-border/50 backdrop-blur-sm">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                        "rounded-full px-3 gap-2 hover:bg-background transition-all",
                        liked && "text-red-500 bg-red-500/10 hover:bg-red-500/20"
                    )}
                    onClick={() => setLiked(!liked)}
                >
                    <Heart className={cn("w-4 h-4", liked && "fill-current")} />
                    <span className="text-xs">{liked ? 1243 : 1242}</span>
                </Button>
                <div className="w-px h-4 bg-border" />
                <Button variant="ghost" size="sm" className="rounded-full px-3 gap-2 hover:bg-background">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-xs">482</span>
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full px-3 gap-2 hover:bg-background">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-xs">86</span>
                </Button>
            </div>
        </div>

        {/* End of Chapter Navigation */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col gap-6">
            <div className="flex justify-center gap-4">
              <Button variant="outline" size="sm" className="rounded-full gap-2 text-muted-foreground">
                <Share2 className="w-4 h-4" /> Share
              </Button>
              <Button variant="outline" size="sm" className="rounded-full gap-2 text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" /> Options
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {prevChapter ? (
                <div 
                  onClick={() => {
                    setLocation(`/read/${prevChapter.slug}`);
                  }}
                  className="group cursor-pointer p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-secondary/50 transition-all text-left"
                >
                  <span className="text-xs text-muted-foreground block mb-1">Previous</span>
                  <span className="font-display font-bold text-sm line-clamp-1">{prevChapter.title}</span>
                </div>
              ) : <div />}

              {nextChapter ? (
                <div 
                  onClick={() => {
                     setLocation(`/read/${nextChapter.slug}`);
                  }}
                  className="group cursor-pointer p-4 rounded-xl border border-primary bg-primary/5 hover:bg-primary/10 transition-all text-right"
                >
                  <span className="text-xs text-primary block mb-1">Next Chapter</span>
                  <span className="font-display font-bold text-sm line-clamp-1">{nextChapter.title}</span>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-border bg-secondary/20 text-center flex items-center justify-center">
                   <span className="text-sm text-muted-foreground font-serif italic">To be continued...</span>
                </div>
              )}
            </div>
            
            <Link href="/toc">
                <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary">
                    Back to Table of Contents
                </Button>
            </Link>
          </div>
        </div>
      </article>

      {/* Bottom Progress/Nav (Optional - kept simple for now) */}
      
    </Layout>
  );
}
