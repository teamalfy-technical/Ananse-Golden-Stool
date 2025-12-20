import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Export auth models (required for Replit Auth integration)
export * from "./models/auth";
import { users } from "./models/auth";

// User profiles with additional metadata
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull().default("reader"), // "reader" or "admin"
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chapters
export const chapters = pgTable("chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  order: integer("order").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // "draft", "published"
  readTime: integer("read_time").notNull(), // in minutes
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reading progress tracking
export const readingProgress = pgTable("reading_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  chapterId: varchar("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
  scrollPosition: real("scroll_position").notNull().default(0), // percentage 0-1
  completed: boolean("completed").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  readingProgress: many(readingProgress),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const chaptersRelations = relations(chapters, ({ many }) => ({
  readingProgress: many(readingProgress),
}));

export const readingProgressRelations = relations(readingProgress, ({ one }) => ({
  user: one(users, {
    fields: [readingProgress.userId],
    references: [users.id],
  }),
  chapter: one(chapters, {
    fields: [readingProgress.chapterId],
    references: [chapters.id],
  }),
}));

// Zod schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateChapterSchema = insertChapterSchema.partial();

export const insertReadingProgressSchema = createInsertSchema(readingProgress).omit({
  id: true,
  updatedAt: true,
});

export const updateReadingProgressSchema = createInsertSchema(readingProgress).omit({
  id: true,
  userId: true,
  chapterId: true,
}).partial();

// Types
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type UpdateChapter = z.infer<typeof updateChapterSchema>;

export type ReadingProgress = typeof readingProgress.$inferSelect;
export type InsertReadingProgress = z.infer<typeof insertReadingProgressSchema>;
export type UpdateReadingProgress = z.infer<typeof updateReadingProgressSchema>;
