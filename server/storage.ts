import {
  chapters,
  profiles,
  readingProgress,
  bookmarks,
  likes,
  type Chapter,
  type InsertChapter,
  type UpdateChapter,
  type Profile,
  type InsertProfile,
  type ReadingProgress,
  type InsertReadingProgress,
  type UpdateReadingProgress,
  type Bookmark,
  type InsertBookmark,
  type Like,
  type InsertLike,
  type SiteSetting,
  type InsertSiteSetting
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, inArray } from "drizzle-orm";
import { siteSettings } from "@shared/schema";

export interface IStorage {
  // Chapters
  getAllChapters(): Promise<Chapter[]>;
  getPublishedChapters(): Promise<Chapter[]>;
  getChapterBySlug(slug: string): Promise<Chapter | undefined>;
  getChapterById(id: string): Promise<Chapter | undefined>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: string, chapter: UpdateChapter): Promise<Chapter | undefined>;
  deleteChapter(id: string): Promise<void>;

  // Profiles
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, data: Partial<InsertProfile>): Promise<Profile | undefined>;

  // Reading Progress
  getReadingProgress(userId: string, chapterId: string): Promise<ReadingProgress | undefined>;
  getAllUserProgress(userId: string): Promise<ReadingProgress[]>;
  upsertReadingProgress(progress: InsertReadingProgress): Promise<ReadingProgress>;
  getLastReadChapter(userId: string): Promise<{ chapterId: string; scrollPosition: number; updatedAt: Date } | undefined>;

  // Bookmarks
  getBookmarksByUser(userId: string): Promise<Bookmark[]>;
  getBookmarksByChapter(userId: string, chapterId: string): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(id: string, userId: string): Promise<void>;

  // Likes
  getLike(userId: string, chapterId: string): Promise<Like | undefined>;
  getLikeCount(chapterId: string): Promise<number>;
  toggleLike(userId: string, chapterId: string): Promise<{ liked: boolean; count: number }>;

  // Site Settings
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  getAllSiteSettings(): Promise<SiteSetting[]>;
  updateSiteSetting(key: string, value: string): Promise<SiteSetting>;
}

export class DatabaseStorage implements IStorage {
  // Chapters
  async getAllChapters(): Promise<Chapter[]> {
    return await db.select().from(chapters).orderBy(chapters.order);
  }

  async getPublishedChapters(): Promise<Chapter[]> {
    return await db
      .select()
      .from(chapters)
      .where(eq(chapters.status, "published"))
      .orderBy(chapters.order);
  }

  async getChapterBySlug(slug: string): Promise<Chapter | undefined> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.slug, slug));
    return chapter;
  }

  async getChapterById(id: string): Promise<Chapter | undefined> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
    return chapter;
  }

  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const [chapter] = await db.insert(chapters).values(insertChapter).returning();
    return chapter;
  }

  async updateChapter(id: string, updateData: UpdateChapter): Promise<Chapter | undefined> {
    const [chapter] = await db
      .update(chapters)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(chapters.id, id))
      .returning();
    return chapter;
  }

  async deleteChapter(id: string): Promise<void> {
    await db.delete(chapters).where(eq(chapters.id, id));
  }

  // Profiles
  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const [profile] = await db.insert(profiles).values(insertProfile).returning();
    return profile;
  }

  async updateProfile(userId: string, data: Partial<InsertProfile>): Promise<Profile | undefined> {
    const [profile] = await db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return profile;
  }

  // Reading Progress
  async getReadingProgress(userId: string, chapterId: string): Promise<ReadingProgress | undefined> {
    const [progress] = await db
      .select()
      .from(readingProgress)
      .where(and(eq(readingProgress.userId, userId), eq(readingProgress.chapterId, chapterId)));
    return progress;
  }

  async getAllUserProgress(userId: string): Promise<ReadingProgress[]> {
    return await db.select().from(readingProgress).where(eq(readingProgress.userId, userId));
  }

  async upsertReadingProgress(progressData: InsertReadingProgress): Promise<ReadingProgress> {
    const [progress] = await db
      .insert(readingProgress)
      .values(progressData)
      .onConflictDoUpdate({
        target: [readingProgress.userId, readingProgress.chapterId],
        set: {
          scrollPosition: progressData.scrollPosition,
          completed: progressData.completed,
          updatedAt: new Date(),
        },
      })
      .returning();
    return progress;
  }

  async getLastReadChapter(userId: string): Promise<{ chapterId: string; scrollPosition: number; updatedAt: Date } | undefined> {
    const [result] = await db
      .select({
        chapterId: readingProgress.chapterId,
        scrollPosition: readingProgress.scrollPosition,
        updatedAt: readingProgress.updatedAt,
      })
      .from(readingProgress)
      .where(eq(readingProgress.userId, userId))
      .orderBy(desc(readingProgress.updatedAt))
      .limit(1);
    return result ? { chapterId: result.chapterId, scrollPosition: result.scrollPosition, updatedAt: result.updatedAt! } : undefined;
  }

  // Bookmarks
  async getBookmarksByUser(userId: string): Promise<Bookmark[]> {
    return await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt));
  }

  async getBookmarksByChapter(userId: string, chapterId: string): Promise<Bookmark[]> {
    return await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.chapterId, chapterId)))
      .orderBy(bookmarks.paragraphIndex);
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const [bookmark] = await db.insert(bookmarks).values(insertBookmark).returning();
    return bookmark;
  }

  async deleteBookmark(id: string, userId: string): Promise<void> {
    await db.delete(bookmarks).where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)));
  }

  // Likes
  async getLike(userId: string, chapterId: string): Promise<Like | undefined> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.chapterId, chapterId)));
    return like;
  }

  async getLikeCount(chapterId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(likes)
      .where(eq(likes.chapterId, chapterId));
    return result?.count || 0;
  }

  async toggleLike(userId: string, chapterId: string): Promise<{ liked: boolean; count: number }> {
    const existingLike = await this.getLike(userId, chapterId);

    if (existingLike) {
      await db.delete(likes).where(eq(likes.id, existingLike.id));
      const newCount = await this.getLikeCount(chapterId);
      return { liked: false, count: newCount };
    } else {
      await db.insert(likes).values({ userId, chapterId });
      const newCount = await this.getLikeCount(chapterId);
      return { liked: true, count: newCount };
    }
  }

  // Site Settings
  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }

  async getAllSiteSettings(): Promise<SiteSetting[]> {
    return await db.select().from(siteSettings);
  }

  async updateSiteSetting(key: string, value: string): Promise<SiteSetting> {
    const [setting] = await db
      .insert(siteSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: [siteSettings.key],
        set: { value, updatedAt: new Date() },
      })
      .returning();
    return setting;
  }
}

export const storage = new DatabaseStorage();

