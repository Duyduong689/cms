export declare class CreatePostDto {
    title: string;
    slug?: string;
    content: string;
    excerpt: string;
    coverImage?: string;
    authorId?: string;
    tags: string[];
    status?: 'draft' | 'published';
    metaTitle?: string;
    metaDescription?: string;
    openGraphImage?: string;
}
