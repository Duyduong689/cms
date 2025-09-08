"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, Pencil, Trash, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  updatedAt: string;
};

type PostActionsProps = {
  post: Post;
  onDelete: (id: string) => void;
};

const PostActions = ({ post, onDelete }: PostActionsProps) => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    onDelete(post.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
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
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash className="w-4 h-4" />
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post
              <strong> {post.title}</strong> and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const createPostColumns = (remove: (id: string) => void) => {
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
        <PostActions post={post} onDelete={remove} />
      ),
    },
  ];
};
