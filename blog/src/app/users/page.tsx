"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CustomPagination from "@/components/ui/custom-pagination";
import { Plus, Users as UsersIcon } from "lucide-react";
import { UserFilters } from "@/components/app/users/filters";
import { useState } from "react";
import { useDeleteUser, useUsers, useToggleUserStatus, useResetUserPassword } from "@/hooks/use-users";
import { DataTable } from "@/components/ui/data-table";
import { useRouter } from "next/navigation";
import { createUserColumns } from "@/components/app/users/columns";

export default function Users() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [pageSize, setPageSize] = useState(10);

  // Queries
  const { data, isLoading, refetch } = useUsers({
    page,
    limit: pageSize,
    q: query || undefined,
    role: role || undefined,
    status: status || undefined,
  });

  // Mutations
  const deleteUser = useDeleteUser();
  const toggleUserStatus = useToggleUserStatus();
  const resetUserPassword = useResetUserPassword();

  const handleDelete = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleUserStatus.mutateAsync(id);
    } catch (error) {
      console.error('Toggle status error:', error);
    }
  };

  const handleResetPassword = async (id: string) => {
    try {
      await resetUserPassword.mutateAsync(id);
    } catch (error) {
      console.error('Reset password error:', error);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">Manage user accounts, roles, and permissions.</p>
        </div>
        <Button onClick={() => router.push("/users/new")}>
          <Plus className="w-4 h-4 mr-2" />
          New User
        </Button>
      </div>

      <UserFilters
        defaultValues={{
          query,
          role,
          status,
        }}
        onSearch={({ query: newQuery, role: newRole, status: newStatus }) => {
          setQuery(newQuery);
          setRole(newRole);
          setStatus(newStatus);
          setPage(1);
        }}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <DataTable
              columns={createUserColumns(handleDelete, handleToggleStatus, handleResetPassword)}
              data={data?.items}
              isLoading={isLoading}
              loadingRowCount={pageSize}
              emptyStateMessage="No users found"
              emptyStateDescription="Try adjusting your search or filter criteria"
              emptyStateIcon={<UsersIcon className="h-12 w-12 text-muted-foreground" />}
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
