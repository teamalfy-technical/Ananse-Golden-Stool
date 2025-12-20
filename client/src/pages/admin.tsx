import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllChapters, createChapter, updateChapter, deleteChapter, getProfile } from "@/lib/api";
import type { Chapter, InsertChapter, UpdateChapter } from "@shared/schema";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Eye, Home, LogOut } from "lucide-react";
import { isUnauthorizedError } from "@/lib/auth-utils";
import { useLocation } from "wouter";

export default function AdminPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: chapters = [], isLoading: chaptersLoading, error: chaptersError } = useQuery({
    queryKey: ["admin-chapters"],
    queryFn: getAllChapters,
    enabled: isAuthenticated && profile?.role === "admin",
  });

  useEffect(() => {
    if (profileError) {
      if (isUnauthorizedError(profileError)) {
        toast.error("Session expired. Logging in again...");
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
      }
    }
  }, [profileError]);

  useEffect(() => {
    if (chaptersError) {
      if (isUnauthorizedError(chaptersError)) {
        toast.error("Session expired. Logging in again...");
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
      } else {
        toast.error("Failed to load chapters");
      }
    }
  }, [chaptersError]);

  const createMutation = useMutation({
    mutationFn: createChapter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chapters"] });
      toast.success("Chapter created successfully");
      setIsDialogOpen(false);
      setEditingChapter(null);
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast.error("Session expired. Logging in again...");
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
      } else {
        toast.error(error.message || "Failed to create chapter");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChapter }) => updateChapter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chapters"] });
      toast.success("Chapter updated successfully");
      setIsDialogOpen(false);
      setEditingChapter(null);
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast.error("Session expired. Logging in again...");
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
      } else {
        toast.error(error.message || "Failed to update chapter");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChapter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chapters"] });
      toast.success("Chapter deleted successfully");
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast.error("Session expired. Logging in again...");
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
      } else {
        toast.error(error.message || "Failed to delete chapter");
      }
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please log in to access admin");
      setTimeout(() => { window.location.href = "/api/login"; }, 500);
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || profileLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || profile?.role !== "admin") {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You must be an admin to access this page.</p>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </div>
      </Layout>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: InsertChapter | UpdateChapter = {
      slug: formData.get("slug") as string,
      title: formData.get("title") as string,
      excerpt: formData.get("excerpt") as string || null,
      content: formData.get("content") as string,
      order: parseInt(formData.get("order") as string),
      status: formData.get("status") as "draft" | "published",
      readTime: parseInt(formData.get("readTime") as string),
      publishedAt: formData.get("status") === "published" ? new Date() : null,
    };

    if (editingChapter) {
      updateMutation.mutate({ id: editingChapter.id, data });
    } else {
      createMutation.mutate(data as InsertChapter);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Manage chapters for Ananse and the Golden Deception</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-home">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/api/logout"} data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="mb-6" 
              onClick={() => { setEditingChapter(null); setIsDialogOpen(true); }}
              data-testid="button-new-chapter"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chapter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingChapter ? "Edit Chapter" : "Create New Chapter"}</DialogTitle>
              <DialogDescription>
                {editingChapter ? "Update the chapter details below" : "Fill in the chapter details to publish a new installment"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingChapter?.title || ""}
                  placeholder="Chapter 4: The Truth Revealed"
                  required
                  data-testid="input-title"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  defaultValue={editingChapter?.slug || ""}
                  placeholder="chapter-4-truth-revealed"
                  required
                  data-testid="input-slug"
                />
              </div>
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  defaultValue={editingChapter?.excerpt || ""}
                  placeholder="A brief description of the chapter..."
                  rows={2}
                  data-testid="input-excerpt"
                />
              </div>
              <div>
                <Label htmlFor="content">Content (Markdown)</Label>
                <Textarea
                  id="content"
                  name="content"
                  defaultValue={editingChapter?.content || ""}
                  placeholder="Write the chapter content in Markdown..."
                  rows={12}
                  required
                  className="font-mono text-sm"
                  data-testid="input-content"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    defaultValue={editingChapter?.order || chapters.length + 1}
                    required
                    data-testid="input-order"
                  />
                </div>
                <div>
                  <Label htmlFor="readTime">Read Time (minutes)</Label>
                  <Input
                    id="readTime"
                    name="readTime"
                    type="number"
                    defaultValue={editingChapter?.readTime || 5}
                    required
                    data-testid="input-readtime"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editingChapter?.status || "draft"}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setEditingChapter(null); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save">
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingChapter ? "Update" : "Create"} Chapter
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {chaptersLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {chapters.map((chapter) => (
              <Card key={chapter.id} data-testid={`card-chapter-${chapter.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">#{chapter.order}</span>
                        {chapter.title}
                      </CardTitle>
                      <CardDescription className="mt-1">{chapter.excerpt}</CardDescription>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${chapter.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {chapter.status}
                    </span>
                  </div>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {chapter.readTime} min read • {chapter.publishedAt ? new Date(chapter.publishedAt).toLocaleDateString() : "Not published"}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setLocation(`/read/${chapter.slug}`)}
                      data-testid={`button-view-${chapter.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => { setEditingChapter(chapter); setIsDialogOpen(true); }}
                      data-testid={`button-edit-${chapter.id}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => {
                        if (confirm(`Delete "${chapter.title}"?`)) {
                          deleteMutation.mutate(chapter.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${chapter.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
