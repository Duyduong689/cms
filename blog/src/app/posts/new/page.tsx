"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreatePost } from "@/hooks/use-posts";
import { Post } from "@/lib/api";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const emptyPost: Omit<Post, "id" | "createdAt" | "updatedAt"> = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  coverImage: "",
  authorId: "",
  tags: [],
  status: "draft",
  metaTitle: "",
  metaDescription: "",
  openGraphImage: "",
};

export default function NewPost() {
  const router = useRouter();
  const [post, setPost] = useState<typeof emptyPost>(emptyPost);
  const createPost = useCreatePost();

  const save = async () => {
    try {
      const result = await createPost.mutateAsync({
        ...post,
        slug: post.slug || slugify(post.title)
      });
      router.push(`/posts/${result.id}`);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="w-4 h-4 mr-2"/>Back</Button>
        <Button onClick={save} disabled={createPost.isPending}><Save className="w-4 h-4 mr-2"/>Save</Button>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <div className="font-semibold text-lg">New Post</div>
        </div>
        <div className="p-6 space-y-4">
          <Input
            placeholder="Title"
            value={post.title}
            onChange={(e) => setPost({
              ...post,
              title: e.target.value,
              slug: post.slug || slugify(e.target.value)
            })}
          />
          <Input
            placeholder="Slug"
            value={post.slug}
            onChange={(e) => setPost({ ...post, slug: slugify(e.target.value) })}
          />
          <Textarea
            placeholder="Excerpt"
            value={post.excerpt}
            onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
          />
          <Tabs defaultValue="content">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="space-y-4">
              <Textarea 
                rows={15} 
                placeholder="Write in Markdown..." 
                value={post.content} 
                onChange={(e) => setPost({ ...post, content: e.target.value })} 
              />
              <Input 
                placeholder="Cover Image URL (R2/S3)" 
                value={post.coverImage} 
                onChange={(e) => setPost({ ...post, coverImage: e.target.value })} 
              />
              <Input 
                placeholder="Tags (comma separated)" 
                value={post.tags.join(", ")} 
                onChange={(e) => setPost({ 
                  ...post, 
                  tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) 
                })} 
              />
              <Select 
                value={post.status} 
                onValueChange={(v) => setPost({ ...post, status: v as Post["status"] })}
              >
                <SelectTrigger><SelectValue placeholder="Status"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </TabsContent>
            <TabsContent value="seo" className="space-y-4">
              <Input 
                placeholder="Meta Title" 
                value={post.metaTitle || ""} 
                onChange={(e) => setPost({ ...post, metaTitle: e.target.value })} 
              />
              <Textarea 
                rows={4} 
                placeholder="Meta Description" 
                value={post.metaDescription || ""} 
                onChange={(e) => setPost({ ...post, metaDescription: e.target.value })} 
              />
              <Input 
                placeholder="Open Graph Image URL" 
                value={post.openGraphImage || ""} 
                onChange={(e) => setPost({ ...post, openGraphImage: e.target.value })} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
