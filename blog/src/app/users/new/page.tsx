"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateUser } from "@/hooks/use-users";
import { userFormSchema, type UserFormValues } from "@/lib/schemas/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { USER_ROLES, USER_STATUSES, USER_ROLE_LABELS, USER_STATUS_LABELS, DEFAULT_USER_VALUES } from "@/lib/constants/user";

const defaultValues: Partial<UserFormValues> = {
  name: "",
  email: "",
  role: DEFAULT_USER_VALUES.role,
  status: DEFAULT_USER_VALUES.status,
  avatarUrl: "",
};

export default function NewUser() {
  const router = useRouter();
  const createUser = useCreateUser();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema) as any,
    defaultValues,
  });

  const onSubmit = async (data: UserFormValues) => {
    try {
      // Remove empty avatar URL
      const submitData = { ...data };
      if (!submitData.avatarUrl) {
        delete submitData.avatarUrl;
      }
      
      const result = await createUser.mutateAsync(submitData);
      router.push(`/users/${result.id}`);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={createUser.isPending || form.formState.isSubmitting}
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <div className="font-semibold text-lg">New User</div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Full name" 
                      {...field}
                    />
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
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={USER_ROLES.ADMIN}>{USER_ROLE_LABELS[USER_ROLES.ADMIN]}</SelectItem>
                        <SelectItem value={USER_ROLES.STAFF}>{USER_ROLE_LABELS[USER_ROLES.STAFF]}</SelectItem>
                        <SelectItem value={USER_ROLES.CUSTOMER}>{USER_ROLE_LABELS[USER_ROLES.CUSTOMER]}</SelectItem>
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
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={USER_STATUSES.ACTIVE}>{USER_STATUS_LABELS[USER_STATUSES.ACTIVE]}</SelectItem>
                        <SelectItem value={USER_STATUSES.DISABLED}>{USER_STATUS_LABELS[USER_STATUSES.DISABLED]}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
