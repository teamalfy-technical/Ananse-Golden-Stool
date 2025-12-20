import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getChapters, getProgress } from "@/lib/api";
import Layout from "@/components/layout";
import { CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TOC() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: chapters = [], isLoading: chaptersLoading } = useQuery({
    queryKey: ["chapters"],
    queryFn: getChapters,
  });

  const { data: progressData = [] } = useQuery({
    queryKey: ["progress"],
    queryFn: getProgress,
    enabled: isAuthenticated,
  });

  const progressMap = Object.fromEntries(
    progressData.map((p) => [p.chapterId, p])
  );

  const readCount = progressData.filter((p) => p.completed).length;

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
      <div className="max-w-md mx-auto min-h-screen px-6 py-8">
        <header className="mb-8 flex items-center gap-4">
          <Link href="/">
            <button className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" data-testid="button-back">
              <ChevronLeft className="w-6 h-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold">Contents</h1>
            <p className="text-sm text-muted-foreground font-sans">
              {isAuthenticated ? `${readCount} of ${chapters.length} chapters read` : `${chapters.length} chapters available`}
            </p>
          </div>
        </header>

        <div className="space-y-6 relative">
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-border -z-10" />

          {chapters.map((chapter) => {
            const progress = progressMap[chapter.id];
            const isRead = progress?.completed || false;
            const scrollPosition = progress?.scrollPosition || 0;
            const isStarted = scrollPosition > 0;
            
            return (
              <div 
                key={chapter.id}
                onClick={() => setLocation(`/read/${chapter.slug}`)}
                className="group flex gap-6 cursor-pointer relative"
                data-testid={`card-chapter-${chapter.id}`}
              >
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

                <div className="flex-1 pb-6 border-b border-border/40 group-last:border-0 group-hover:pl-2 transition-all duration-300">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={cn(
                      "font-display text-lg transition-colors",
                      isRead ? "text-foreground" : "text-foreground group-hover:text-primary"
                    )} data-testid={`text-chapter-title-${chapter.id}`}>
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
                          style={{ width: `${scrollPosition * 100}%` }}
                        />
                      </div>
                      <span>{Math.round(scrollPosition * 100)}%</span>
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
