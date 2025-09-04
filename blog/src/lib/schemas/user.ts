import { z } from "zod";
import { USER_ROLES, USER_STATUSES } from "@/lib/constants/user";

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters").max(80, "Name must be less than 80 characters"),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.CUSTOMER]),
  status: z.enum([USER_STATUSES.ACTIVE, USER_STATUSES.DISABLED]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const userCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80, "Name must be less than 80 characters"),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.CUSTOMER]).default(USER_ROLES.CUSTOMER),
  status: z.enum([USER_STATUSES.ACTIVE, USER_STATUSES.DISABLED]).default(USER_STATUSES.ACTIVE),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80, "Name must be less than 80 characters").optional(),
  email: z.string().email("Invalid email address").toLowerCase().trim().optional(),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.CUSTOMER]).optional(),
  status: z.enum([USER_STATUSES.ACTIVE, USER_STATUSES.DISABLED]).optional(),
});

export const userFormSchema = userCreateSchema;

// Export TypeScript types
export type User = z.infer<typeof userSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserFormValues = z.infer<typeof userFormSchema>;

// Query parameters for listing users
export interface UserQueryParams {
  q?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Response type for paginated users list
export interface UsersResponse {
  items: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
