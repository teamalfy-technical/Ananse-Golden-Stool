import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'sepia';

interface SettingsState {
  theme: Theme;
  fontSize: number; // in percentage, default 100
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      fontSize: 100,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    {
      name: 'reader-settings',
    }
  )
);

interface ProgressState {
  readChapters: Record<string, boolean>; // chapterId -> boolean
  lastReadChapterId: string | null;
  chapterProgress: Record<string, number>; // chapterId -> scrollPercentage
  markChapterAsRead: (id: string) => void;
  setLastReadChapter: (id: string) => void;
  setChapterProgress: (id: string, progress: number) => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      readChapters: {},
      lastReadChapterId: null,
      chapterProgress: {},
      markChapterAsRead: (id) =>
        set((state) => ({
          readChapters: { ...state.readChapters, [id]: true },
        })),
      setLastReadChapter: (id) => set({ lastReadChapterId: id }),
      setChapterProgress: (id, progress) =>
        set((state) => ({
          chapterProgress: { ...state.chapterProgress, [id]: progress },
        })),
    }),
    {
      name: 'reading-progress',
    }
  )
);
