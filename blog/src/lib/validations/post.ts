import { z } from "zod";

export const postFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  coverImage: z.string().optional(),
  authorId: z.string().optional(),
  tags: z.array(z.string()),
  status: z.enum(["draft", "published"]).default("draft"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  openGraphImage: z.string().optional(),
});

export type PostFormValues = z.infer<typeof postFormSchema>;
