import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { verifyFirebaseToken, optionalFirebaseAuth } from "./firebase-auth";
import {
  insertChapterSchema,
  updateChapterSchema,
  insertReadingProgressSchema,
  updateReadingProgressSchema,
  insertProfileSchema,
  insertBookmarkSchema
} from "@shared/schema";
import { z } from "zod";

// Middleware alias for cleaner route definitions
const isAuthenticated = verifyFirebaseToken;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Helper function to check if user is admin
  async function isAdmin(userId: string | undefined): Promise<boolean> {
    if (!userId) return false;
    const profile = await storage.getProfileByUserId(userId);
    return profile?.role === "admin";
  }

  // Auth diagnostic route
  app.get("/api/me", optionalFirebaseAuth, async (req, res) => {
    const user = (req as any).user;
    if (!user) {
      return res.json({ authenticated: false });
    }

    const profile = await storage.getProfileByUserId(user.uid);
    res.json({
      authenticated: true,
      uid: user.uid,
      email: user.email,
      role: profile?.role || "reader"
    });
  });

  // CHAPTER ROUTES (Public)

  // Get all published chapters
  app.get("/api/chapters", async (_req, res) => {
    try {
      const chapters = await storage.getPublishedChapters();
      res.json(chapters);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      res.status(500).json({ message: "Failed to fetch chapters" });
    }
  });

  // Get chapter by slug
  app.get("/api/chapters/:slug", async (req, res) => {
    try {
      const chapter = await storage.getChapterBySlug(req.params.slug);
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }

      // Only return published chapters to non-admins
      if (chapter.status !== "published") {
        const userId = (req as any).user?.uid;
        if (!userId) {
          return res.status(404).json({ message: "Chapter not found" });
        }
        const userIsAdmin = await isAdmin(userId);
        if (!userIsAdmin) {
          return res.status(404).json({ message: "Chapter not found" });
        }
      }

      res.json(chapter);
    } catch (error) {
      console.error("Error fetching chapter:", error);
      res.status(500).json({ message: "Failed to fetch chapter" });
    }
  });

  // ADMIN CHAPTER ROUTES (Protected)

  // Get all chapters (including drafts) - Admin only
  app.get("/api/admin/chapters", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      const userIsAdmin = await isAdmin(userId);

      if (!userIsAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const chapters = await storage.getAllChapters();
      res.json(chapters);
    } catch (error) {
      console.error("Error fetching all chapters:", error);
      res.status(500).json({ message: "Failed to fetch chapters" });
    }
  });

  // Create chapter - Admin only
  app.post("/api/admin/chapters", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      const userIsAdmin = await isAdmin(userId);

      if (!userIsAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const chapterData = insertChapterSchema.parse(req.body);
      const chapter = await storage.createChapter(chapterData);
      res.status(201).json(chapter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid chapter data", errors: error.errors });
      }
      console.error("Error creating chapter:", error);
      res.status(500).json({ message: "Failed to create chapter" });
    }
  });

  // Update chapter - Admin only
  app.patch("/api/admin/chapters/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      const userIsAdmin = await isAdmin(userId);

      if (!userIsAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      const chapterData = updateChapterSchema.parse(req.body);
      const chapter = await storage.updateChapter(req.params.id, chapterData);

      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }

      res.json(chapter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid chapter data", errors: error.errors });
      }
      console.error("Error updating chapter:", error);
      res.status(500).json({ message: "Failed to update chapter" });
    }
  });

  // Delete chapter - Admin only
  app.delete("/api/admin/chapters/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      const userIsAdmin = await isAdmin(userId);

      if (!userIsAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      await storage.deleteChapter(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting chapter:", error);
      res.status(500).json({ message: "Failed to delete chapter" });
    }
  });

  // PROFILE ROUTES (Protected)

  // Get user's own profile
  app.get("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      let profile = await storage.getProfileByUserId(userId);

      // Auto-create profile if it doesn't exist
      if (!profile) {
        profile = await storage.createProfile({
          userId,
          role: "reader",
          displayName: null,
        });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Update user's own profile
  app.patch("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      const updateData = insertProfileSchema.partial().omit({ userId: true }).parse(req.body);

      const profile = await storage.updateProfile(userId, updateData);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // READING PROGRESS ROUTES (Protected)

  // Get all user's reading progress
  app.get("/api/progress", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      const progress = await storage.getAllUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Get last read chapter
  app.get("/api/progress/last", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      const lastRead = await storage.getLastReadChapter(userId);
      res.json(lastRead || null);
    } catch (error) {
      console.error("Error fetching last read:", error);
      res.status(500).json({ message: "Failed to fetch last read chapter" });
    }
  });

  // Update reading progress for a chapter
  app.post("/api/progress", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      const progressData = updateReadingProgressSchema.parse(req.body);

      // Add userId to the data
      const fullProgressData = {
        userId,
        chapterId: req.body.chapterId,
        ...progressData,
      };

      const progress = await storage.upsertReadingProgress(fullProgressData);
      res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // BOOKMARK ROUTES (Protected)

  // Get all bookmarks for current user
  app.get("/api/bookmarks", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      const bookmarks = await storage.getBookmarksByUser(userId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  // Get bookmarks for specific chapter
  app.get("/api/bookmarks/chapter/:chapterId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      const bookmarks = await storage.getBookmarksByChapter(userId, req.params.chapterId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching chapter bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  // Create bookmark
  app.post("/api/bookmarks", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      const bookmarkData = insertBookmarkSchema.omit({ userId: true }).parse(req.body);

      const bookmark = await storage.createBookmark({
        ...bookmarkData,
        userId,
      });
      res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bookmark data", errors: error.errors });
      }
      console.error("Error creating bookmark:", error);
      res.status(500).json({ message: "Failed to create bookmark" });
    }
  });

  // Delete bookmark
  app.delete("/api/bookmarks/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      await storage.deleteBookmark(req.params.id, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      res.status(500).json({ message: "Failed to delete bookmark" });
    }
  });

  // LIKE ROUTES

  // Get like status and count for a chapter
  app.get("/api/likes/:chapterId", async (req, res) => {
    try {
      const chapterId = req.params.chapterId;
      const count = await storage.getLikeCount(chapterId);

      let liked = false;
      const user = (req as any).user;
      if (user) {
        const like = await storage.getLike(user.uid, chapterId);
        liked = !!like;
      }

      res.json({ liked, count });
    } catch (error) {
      console.error("Error fetching likes:", error);
      res.status(500).json({ message: "Failed to fetch likes" });
    }
  });

  // Toggle like for a chapter
  app.post("/api/likes/:chapterId", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user?.uid;
      const chapterId = req.params.chapterId;

      const result = await storage.toggleLike(userId, chapterId);
      res.json(result);
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  return httpServer;
}
