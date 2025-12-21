import type { Chapter, InsertChapter, UpdateChapter, ReadingProgress, Profile, Bookmark } from "@shared/schema";
import { getIdToken } from "./firebase";

async function fetchApi(url: string, options?: RequestInit) {
  // Get Firebase auth token if user is logged in
  const token = await getIdToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  // Add auth header if we have a token
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Chapters (Public)
export async function getChapters(): Promise<Chapter[]> {
  return fetchApi("/api/chapters");
}

export async function getChapterBySlug(slug: string): Promise<Chapter> {
  return fetchApi(`/api/chapters/${slug}`);
}

// Admin Chapter Routes
export async function getAllChapters(): Promise<Chapter[]> {
  return fetchApi("/api/admin/chapters");
}

export async function createChapter(data: InsertChapter): Promise<Chapter> {
  return fetchApi("/api/admin/chapters", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateChapter(id: string, data: UpdateChapter): Promise<Chapter> {
  return fetchApi(`/api/admin/chapters/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteChapter(id: string): Promise<void> {
  return fetchApi(`/api/admin/chapters/${id}`, {
    method: "DELETE",
  });
}

// Profile
export async function getProfile(): Promise<Profile> {
  return fetchApi("/api/profile");
}

export async function updateProfile(data: Partial<Profile>): Promise<Profile> {
  return fetchApi("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Reading Progress
export async function getProgress(): Promise<ReadingProgress[]> {
  return fetchApi("/api/progress");
}

export async function getLastRead(): Promise<{ chapterId: string; scrollPosition: number; updatedAt: Date } | null> {
  return fetchApi("/api/progress/last");
}

export async function updateProgress(chapterId: string, scrollPosition: number, completed: boolean): Promise<ReadingProgress> {
  return fetchApi("/api/progress", {
    method: "POST",
    body: JSON.stringify({ chapterId, scrollPosition, completed }),
  });
}

// Bookmarks
export async function getBookmarks(): Promise<Bookmark[]> {
  return fetchApi("/api/bookmarks");
}

export async function getChapterBookmarks(chapterId: string): Promise<Bookmark[]> {
  return fetchApi(`/api/bookmarks/chapter/${chapterId}`);
}

export async function createBookmark(data: { chapterId: string; textSnippet: string; paragraphIndex: number; note?: string }): Promise<Bookmark> {
  return fetchApi("/api/bookmarks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteBookmark(id: string): Promise<void> {
  return fetchApi(`/api/bookmarks/${id}`, {
    method: "DELETE",
  });
}

// Likes
export async function getLikeStatus(chapterId: string): Promise<{ liked: boolean; count: number }> {
  return fetchApi(`/api/likes/${chapterId}`);
}

export async function toggleLike(chapterId: string): Promise<{ liked: boolean; count: number }> {
  return fetchApi(`/api/likes/${chapterId}`, {
    method: "POST",
  });
}

