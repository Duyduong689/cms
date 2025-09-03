"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CustomPagination from "@/components/ui/custom-pagination";
import { Plus, FileText } from "lucide-react";
import { PostFilters } from "@/components/app/posts/filters";
import { useState } from "react";
import { useDeletePost, usePosts } from "@/hooks/use-posts";
import { DataTable } from "@/components/ui/data-table";
import { useRouter } from "next/navigation";
import { createPostColumns } from "@/components/app/posts/columns";

export default function Posts() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("");

  const [pageSize, setPageSize] = useState(10);

  // Queries
  const { data, isLoading, refetch } = usePosts({
    page,
    limit: pageSize,
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


  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Posts</h1>
          <p className="text-muted-foreground mt-1">Create, edit, publish and view posts.</p>
        </div>
        <Button onClick={() => router.push("/posts/new")}><Plus className="w-4 h-4 mr-2"/>New Post</Button>
      </div>

      <PostFilters
        defaultValues={{
          query,
          status
        }}
        onSearch={({ query: newQuery, status: newStatus }) => {
          setQuery(newQuery);
          setStatus(newStatus);
          setPage(1);
        }}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <DataTable
              columns={createPostColumns(remove)}
              data={data?.items}
              isLoading={isLoading}
              loadingRowCount={pageSize}
              emptyStateMessage="No posts found"
              emptyStateDescription="Try adjusting your search or filter criteria"
              emptyStateIcon={<FileText className="h-12 w-12 text-muted-foreground" />}
            />
          </div>
          {data?.meta && data.meta.pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {data.meta.page} of {data.meta.pages} ({data.meta.total} items)
              </div>
              <CustomPagination
                page={data.meta.page}
                pageSize={pageSize}
                totalPages={data.meta.pages}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}