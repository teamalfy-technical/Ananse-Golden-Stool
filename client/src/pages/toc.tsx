import { Link, useLocation } from "wouter";
import { useProgress } from "@/lib/store";
import { CHAPTERS, type Chapter } from "@/lib/mockData";
import Layout from "@/components/layout";
import { CheckCircle2, Circle, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TOC() {
  const { readChapters, chapterProgress } = useProgress();
  const [, setLocation] = useLocation();

  return (
    <Layout>
      <div className="max-w-md mx-auto min-h-screen px-6 py-8">
        <header className="mb-8 flex items-center gap-4">
          <Link href="/">
            <button className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-6 h-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold">Contents</h1>
            <p className="text-sm text-muted-foreground font-sans">
              {Object.keys(readChapters).length} of {CHAPTERS.length} chapters read
            </p>
          </div>
        </header>

        <div className="space-y-6 relative">
          {/* Vertical Line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border -z-10" />

          {CHAPTERS.map((chapter: Chapter, index: number) => {
            const isRead = readChapters[chapter.id];
            const progress = chapterProgress[chapter.id] || 0;
            const isStarted = progress > 0;
            
            return (
              <div 
                key={chapter.id}
                onClick={() => setLocation(`/read/${chapter.slug}`)}
                className="group flex gap-6 cursor-pointer relative"
              >
                {/* Status Indicator */}
                <div className="relative pt-1">
                  <div className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center bg-background transition-colors z-10",
                    isRead 
                      ? "border-primary text-primary" 
                      : isStarted
                        ? "border-primary/50 text-primary/50"
                        : "border-muted text-muted-foreground"
                  )}>
                    {isRead ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="font-mono text-sm font-bold">{chapter.order}</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-6 border-b border-border/40 group-last:border-0 group-hover:pl-2 transition-all duration-300">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={cn(
                      "font-display text-lg transition-colors",
                      isRead ? "text-foreground" : "text-foreground group-hover:text-primary"
                    )}>
                      {chapter.title}
                    </h3>
                    <span className="text-xs font-mono text-muted-foreground whitespace-nowrap ml-2">
                      {chapter.readTime} min
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground font-serif leading-relaxed line-clamp-2 mb-2">
                    {chapter.excerpt}
                  </p>

                  {isStarted && !isRead && (
                    <div className="flex items-center gap-2 text-xs text-primary font-medium">
                      <div className="h-1 w-12 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                      <span>{Math.round(progress * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
