import { 
  chapters, 
  profiles, 
  readingProgress,
  type Chapter,
  type InsertChapter,
  type UpdateChapter,
  type Profile,
  type InsertProfile,
  type ReadingProgress,
  type InsertReadingProgress,
  type UpdateReadingProgress
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

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
  getLastReadChapter(userId: string): Promise<{ chapterId: string; updatedAt: Date } | undefined>;
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

  async getLastReadChapter(userId: string): Promise<{ chapterId: string; updatedAt: Date } | undefined> {
    const [result] = await db
      .select({
        chapterId: readingProgress.chapterId,
        updatedAt: readingProgress.updatedAt,
      })
      .from(readingProgress)
      .where(eq(readingProgress.userId, userId))
      .orderBy(desc(readingProgress.updatedAt))
      .limit(1);
    return result ? { chapterId: result.chapterId, updatedAt: result.updatedAt! } : undefined;
  }
}

export const storage = new DatabaseStorage();
