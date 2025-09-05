"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser, useUpdateUser } from "@/hooks/use-users";
import { userUpdateSchema, type UserUpdateInput } from "@/lib/schemas/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  USER_ROLES,
  USER_STATUSES,
  USER_ROLE_LABELS,
  USER_STATUS_LABELS,
  UserRole,
  UserStatus,
} from "@/lib/constants/user";

export default function EditUser({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: user, isLoading: isLoadingUser } = useUser(params.id);
  const updateUser = useUpdateUser();

  const form = useForm<UserUpdateInput>({
    resolver: zodResolver(userUpdateSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      role: undefined,
      status: undefined,
      avatarUrl: "",
      newPassword: "",
    },
  });

  // Update form when user data loads
  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl || "",
        newPassword: "",
      });
    }
  }, [user, form]);

  const onSubmit = async (data: UserUpdateInput) => {
    try {
      // Remove empty password field if not set
      const submitData = { ...data };
      if (!submitData.newPassword || submitData.newPassword === "") {
        delete submitData.newPassword;
      }
      // Remove empty avatar URL
      if (!submitData.avatarUrl) {
        delete submitData.avatarUrl;
      }

      await updateUser.mutateAsync({ id: params.id, ...submitData });
      router.push(`/users/${params.id}`);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  if (isLoadingUser) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={updateUser.isPending || form.formState.isSubmitting}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <div className="font-semibold text-lg">Edit User</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={(value) => {
                        if (value) {
                          field.onChange(value as UserRole);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={USER_ROLES.ADMIN}>
                          {USER_ROLE_LABELS[USER_ROLES.ADMIN]}
                        </SelectItem>
                        <SelectItem value={USER_ROLES.STAFF}>
                          {USER_ROLE_LABELS[USER_ROLES.STAFF]}
                        </SelectItem>
                        <SelectItem value={USER_ROLES.CUSTOMER}>
                          {USER_ROLE_LABELS[USER_ROLES.CUSTOMER]}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={(value) => {
                        if (value) {
                          field.onChange(value as UserStatus);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={USER_STATUSES.ACTIVE}>
                          {USER_STATUS_LABELS[USER_STATUSES.ACTIVE]}
                        </SelectItem>
                        <SelectItem value={USER_STATUSES.DISABLED}>
                          {USER_STATUS_LABELS[USER_STATUSES.DISABLED]}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Leave blank to keep current password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}
