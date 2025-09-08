"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/use-auth";
import { usePostStats, useRecentPosts } from "@/hooks/use-posts-dashboard";
import { Eye, FileText, Plus, Tags, User } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";


export default function Home() {
  const { data: user, isLoading: isAuthLoading, isError } = useMe();
  const { data: stats, isLoading: statsLoading, isError: statsError } = usePostStats();
  const { data: recent, isLoading: recentLoading, isError: recentError } = useRecentPosts();
  const skeletonRows = useMemo(() => new Array(5).fill(0), []);
  const loading = statsLoading || recentLoading;

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
            <a href="/posts/new">
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
            {loading ? '—' : stats?.posts ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Published
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-primary">
            {loading ? '—' : stats?.published ?? 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {loading ? '—' : stats?.drafts ?? 0}
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
            <Link href="/posts">
              <Eye className="w-4 h-4 mr-2" />
              View all
            </Link>
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
                {!loading && recent &&
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
                {!loading && (!recent || recent.length === 0) && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-muted-foreground"
                    >
                      No posts yet. Create your first one.
                    </td>
                  </tr>
                )}
                {(statsError || recentError) && !loading && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-destructive">
                      Failed to load dashboard. Please try again.
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
