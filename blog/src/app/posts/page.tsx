"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Plus, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { useDeletePost, usePosts } from "@/hooks/use-posts";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function Posts() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("");

  const limit = 10;

  // Queries
  const { data, isLoading, refetch } = usePosts({
    page,
    limit,
    q: query || undefined,
    status: (status as "draft" | "published") || undefined,
  });

  // Mutations
  const deletePost = useDeletePost();

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePost.mutateAsync(id);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const skeletonRows = new Array(limit).fill(0);

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Posts</h1>
          <p className="text-muted-foreground mt-1">Create, edit, publish and view posts.</p>
        </div>
        <Button onClick={() => router.push("/posts/new")}><Plus className="w-4 h-4 mr-2"/>New Post</Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input placeholder="Search title or slug" value={query} onChange={(e)=>setQuery(e.target.value)} />
          <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="All status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-3">
            <Button onClick={() => { setPage(1); refetch(); }}>Search</Button>
            <Button variant="secondary" onClick={() => { setQuery(""); setStatus(""); setPage(1); refetch(); }}>Reset</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Slug</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Updated</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && skeletonRows.map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2"><Skeleton className="h-4 w-3/4"/></td>
                    <td className="py-2"><Skeleton className="h-4 w-1/2"/></td>
                    <td className="py-2"><Skeleton className="h-5 w-16"/></td>
                    <td className="py-2"><Skeleton className="h-4 w-24"/></td>
                    <td className="py-2"/>
                  </tr>
                ))}
                {!isLoading && data?.items.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2 font-medium">{p.title}</td>
                    <td className="py-2 text-muted-foreground">/{p.slug}</td>
                    <td className="py-2"><Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge></td>
                    <td className="py-2 text-muted-foreground">{new Date(p.updatedAt).toLocaleString()}</td>
                    <td className="py-2 text-right flex justify-end gap-1">
                      <Button variant="ghost" onClick={() => router.push(`/posts/${p.id}`)}><Eye className="w-4 h-4 mr-1"/>View</Button>
                      <Button variant="ghost" onClick={() => router.push(`/posts/${p.id}/edit`)}><Pencil className="w-4 h-4 mr-1"/>Edit</Button>
                      <Button variant="ghost" className="text-destructive" onClick={() => remove(p.id)}><Trash className="w-4 h-4"/></Button>
                    </td>
                  </tr>
                ))}
                {!isLoading && (!data?.items || data.items.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">No posts found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={()=> setPage((p)=>Math.max(1,p-1))} />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext onClick={()=> setPage((p)=>p+1)} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}