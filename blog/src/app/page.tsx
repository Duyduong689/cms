"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, FileText, Plus, Tags, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMe } from "@/hooks/use-auth";


interface PostListItem {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  updatedAt: string;
}

export default function Home() {
  const [recent, setRecent] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ posts: 0, drafts: 0, published: 0 });

  const { data: user, isLoading: isAuthLoading, isError } = useMe();
  const skeletonRows = useMemo(() => new Array(5).fill(0), []);

  // Handle loading state - all hooks are called above this point
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle error or no user - return empty div instead of null
  if (isError || !user) {
    return <div></div>; // Protected layout will handle redirect
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Blog CMS Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.name}! Manage posts, categories, authors, tags and SEO.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <a href="/posts#new">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Posts
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {stats.posts}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Published
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-primary">
            {stats.published}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {stats.drafts}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              User Role
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-green-600">
            {user.role}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <Button variant="ghost" asChild>
            <a href="/posts">
              <Eye className="w-4 h-4 mr-2" />
              View all
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Slug</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {loading &&
                  skeletonRows.map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2">
                        <Skeleton className="h-4 w-3/4" />
                      </td>
                      <td className="py-2">
                        <Skeleton className="h-4 w-1/2" />
                      </td>
                      <td className="py-2">
                        <Skeleton className="h-5 w-20" />
                      </td>
                      <td className="py-2">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    </tr>
                  ))}
                {!loading &&
                  recent.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="py-2 font-medium">
                        <a
                          className="hover:underline"
                          href={`/posts?id=${p.id}`}
                        >
                          {p.title}
                        </a>
                      </td>
                      <td className="py-2 text-muted-foreground">/{p.slug}</td>
                      <td className="py-2">
                        <Badge
                          variant={
                            p.status === "published" ? "default" : "secondary"
                          }
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {new Date(p.updatedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                {!loading && recent.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No posts yet. Create your first one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Content
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Rich markdown editor, autoslug, SEO meta and scheduling are
            included.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Tags className="w-4 h-4" />
              Taxonomy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Manage categories and tags with filtering and search.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" />
              Authors
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Assign authors and track contributions.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
