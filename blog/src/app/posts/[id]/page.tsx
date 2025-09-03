"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePost } from "@/hooks/use-posts";
import { mdToHtml } from "@/lib/utils";
import { ArrowLeft, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PostView({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: post, isLoading } = usePost(params.id);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="w-4 h-4 mr-2"/>Back</Button>
        <Button onClick={() => router.push(`/posts/${post.id}/edit`)}><Edit className="w-4 h-4 mr-2"/>Edit</Button>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow-lg overflow-hidden">
        {post.coverImage && (
          <div className="h-64 overflow-hidden bg-muted">
            <img src={post.coverImage} alt="cover" className="w-full h-full object-cover"/>
          </div>
        )}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
          </div>
          <div className="text-sm text-muted-foreground">/{post.slug} • {new Date(post.updatedAt).toLocaleString()}</div>
          {post.excerpt && <p className="text-lg text-muted-foreground">{post.excerpt}</p>}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">#{t}</span>
              ))}
            </div>
          )}
          <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: mdToHtml(post.content || "") }} />
          
          {(post.metaTitle || post.metaDescription || post.openGraphImage) && (
            <div className="mt-8 pt-6 border-t">
              <h2 className="text-xl font-semibold mb-4">SEO Information</h2>
              {post.metaTitle && (
                <div className="mb-2">
                  <div className="font-medium">Meta Title</div>
                  <div className="text-muted-foreground">{post.metaTitle}</div>
                </div>
              )}
              {post.metaDescription && (
                <div className="mb-2">
                  <div className="font-medium">Meta Description</div>
                  <div className="text-muted-foreground">{post.metaDescription}</div>
                </div>
              )}
              {post.openGraphImage && (
                <div>
                  <div className="font-medium">Open Graph Image</div>
                  <img src={post.openGraphImage} alt="og" className="mt-2 rounded-lg max-h-48 object-cover"/>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
