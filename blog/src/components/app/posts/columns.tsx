"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  updatedAt: string;
};

export const createPostColumns = (remove: (id: string) => void) => {
  const router = useRouter();

  return [
    {
      header: "Title",
      cell: (post: Post) => (
        <div className="font-medium">{post.title}</div>
      ),
    },
    {
      header: "Slug",
      cell: (post: Post) => (
        <div className="text-muted-foreground">/{post.slug}</div>
      ),
    },
    {
      header: "Status",
      cell: (post: Post) => (
        <Badge variant={post.status === "published" ? "default" : "secondary"}>
          {post.status}
        </Badge>
      ),
    },
    {
      header: "Updated",
      cell: (post: Post) => (
        <div className="text-muted-foreground">
          {new Date(post.updatedAt).toLocaleString()}
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (post: Post) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" onClick={() => router.push(`/posts/${post.id}`)}>
            <Eye className="w-4 h-4 mr-1" />View
          </Button>
          <Button variant="ghost" onClick={() => router.push(`/posts/${post.id}/edit`)}>
            <Pencil className="w-4 h-4 mr-1" />Edit
          </Button>
          <Button
            variant="ghost"
            className="text-destructive"
            onClick={() => remove(post.id)}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];
};
