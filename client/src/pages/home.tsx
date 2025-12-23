import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getChapters, getLastRead, getMe, getSiteSettings } from "@/lib/api";
import type { Chapter } from "@shared/schema";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, Clock, Linkedin, Loader2, Info, Copy, Check, LogIn, LogOut, User as UserIcon } from "lucide-react";
import { SettingsMenu } from "@/components/reader/settings-menu";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, login, logout, isLoggingIn, isLoggingOut } = useAuth();

  const { data: chapters = [], isLoading: chaptersLoading } = useQuery({
    queryKey: ["chapters"],
    queryFn: getChapters,
  });

  const { data: lastRead } = useQuery({
    queryKey: ["last-read"],
    queryFn: getLastRead,
    enabled: isAuthenticated,
  });

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: isAuthenticated,
  });

  const { data: settings = {} } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSiteSettings,
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyUid = () => {
    if (me?.uid) {
      navigator.clipboard.writeText(me.uid);
      setCopied(true);
      toast.success("UID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
              <span className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
                {settings.site_genre || "Interactive Novel"}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold leading-[0.9] text-foreground mb-4">
              {settings.site_title || "Ananse"}
            </h1>
            <p className="text-lg font-serif italic text-muted-foreground/80 max-w-xs">
              {settings.site_subtitle || "The Golden Deception"}
            </p>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <SettingsMenu />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt={user.name || "User"} className="w-5 h-5 rounded-full" />
                    ) : (
                      <UserIcon className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user?.name || "My Account"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/toc")}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Library
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={login}
                className="text-muted-foreground hover:text-foreground"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
              </Button>
            )}
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
                  style={{ width: `${Math.round((lastRead?.scrollPosition || 0) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground font-sans">
                <span>{Math.round((lastRead?.scrollPosition || 0) * 100)}% complete</span>
                <span className="flex items-center gap-1">
                  Continue <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-xl p-8 text-center space-y-4">
              <BookOpen className="w-12 h-12 text-primary mx-auto opacity-80" />
              <h3 className="text-xl font-display font-bold">
                {lastReadChapter ? "Continue Chapter" : "Begin the Journey"}
              </h3>
              <p className="text-sm text-muted-foreground font-serif leading-relaxed">
                {settings.hero_excerpt || "Step into the world of Kwaku Ananse, where ancient folklore meets modern mystery."}
              </p>
              <div className="space-y-3">
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
                {!isAuthenticated && (
                  <Button
                    variant="outline"
                    className="w-full font-sans"
                    onClick={login}
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogIn className="w-4 h-4 mr-2" />}
                    Sign in with Google
                  </Button>
                )}
              </div>
            </div>
          )}

          {latestChapter && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="flex justify-between items-end border-b border-border pb-2">
                <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {settings.latest_release_label || "Latest Release"}
                </h3>
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
                <span className="font-display text-lg">{settings.toc_label || "Table of Contents"}</span>
                <span className="text-xs text-muted-foreground font-normal">View all chapters</span>
              </Button>
            </Link>
            <div className="opacity-50 cursor-not-allowed">
              <Button variant="outline" disabled className="w-full h-auto py-4 flex flex-col gap-2">
                <span className="font-display text-lg">{settings.characters_label || "Characters"}</span>
                <span className="text-xs text-muted-foreground font-normal">{settings.characters_coming_soon || "Coming Soon"}</span>
              </Button>
            </div>
          </div>

          <div className="pt-8 mt-12 border-t border-border animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-xl backdrop-blur-sm border border-border/50">
              <div className="relative w-16 h-16 shrink-0">
                <img
                  src={settings.author_image || "/author-alfred.png"}
                  alt={settings.author_name || "Alfred Opare Saforo"}
                  className="w-full h-full object-cover object-top rounded-full border-2 border-primary/20 shadow-sm"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary font-mono uppercase tracking-wider mb-1">
                  {settings.author_bio_label || "Written by"}
                </p>
                <h4 className="font-display font-bold text-lg leading-tight truncate">
                  {settings.author_name || "Alfred Opare Saforo"}
                </h4>
                <a
                  href={settings.author_linkedin || "https://linkedin.com/in/alfred2"}
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

          {isAuthenticated && me?.uid && (
            <div className="pt-8 mt-12 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-4 h-4 text-primary" />
                  <h4 className="font-display font-bold text-lg">Diagnostics</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Firebase UID</span>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-background border border-border px-3 py-2 rounded-md text-sm font-mono break-all">
                        {me.uid}
                      </code>
                      <Button size="icon" variant="outline" onClick={copyUid} className="shrink-0 h-10 w-10">
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Logged in as</span>
                    <span className="text-sm font-serif italic">{me.email}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Role</span>
                    <span className={`text-sm font-bold uppercase ${me.role === 'admin' ? 'text-primary' : 'text-muted-foreground'}`}>
                      {me.role}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground italic leading-relaxed">
                  Provide your UID to the developer to enable admin access for your account.
                </p>
              </div>
            </div>
          )}
        </main>
      </div >
    </Layout >
  );
}
