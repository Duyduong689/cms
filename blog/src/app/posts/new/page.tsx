"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePost } from "@/hooks/use-posts";
import { postFormSchema, type PostFormValues } from "@/lib/validations/post";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const defaultValues: Partial<PostFormValues> = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  coverImage: "",
  authorId: "",
  tags: [],
  status: "draft",
  metaTitle: "",
  metaDescription: "",
  openGraphImage: "",
};

export default function NewPost() {
  const router = useRouter();
  const createPost = useCreatePost();
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = React.useState(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema) as any,
    defaultValues,
  });

  const onSubmit = async (data: PostFormValues) => {
    try {
      const result = await createPost.mutateAsync({
        ...data,
        slug: data.slug || slugify(data.title)
      });
      router.push(`/posts/${result.id}`);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="w-4 h-4 mr-2"/>Back</Button>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={createPost.isPending || form.formState.isSubmitting}
        >
          <Save className="w-4 h-4 mr-2"/>Save
        </Button>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <div className="font-semibold text-lg">New Post</div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Post title" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // Auto-generate slug if not manually edited
                        if (!isSlugManuallyEdited) {
                          form.setValue("slug", slugify(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="URL-friendly slug" 
                      {...field}
                      onChange={(e) => {
                        setIsSlugManuallyEdited(true);
                        field.onChange(slugify(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Short summary of the post" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs defaultValue="content">
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={15} 
                          placeholder="Write in Markdown..." 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Cover Image URL (R2/S3)" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Tags (comma separated)" 
                          value={field.value.join(", ")}
                          onChange={(e) => field.onChange(
                            e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                          )}
                        />
                      </FormControl>
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
                            <SelectValue placeholder="Select status"/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="SEO title" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4} 
                          placeholder="SEO description" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="openGraphImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Open Graph Image</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Social media image URL" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </div>
  );
}