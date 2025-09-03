import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    create(createPostDto: CreatePostDto): Promise<{
        coverImage: string | null;
        title: string;
        slug: string;
        content: string;
        excerpt: string;
        authorId: string | null;
        tags: string[];
        status: string;
        metaTitle: string | null;
        metaDescription: string | null;
        openGraphImage: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(query: QueryPostDto): Promise<unknown>;
    findOne(id: string): Promise<unknown>;
    update(id: string, updatePostDto: UpdatePostDto): Promise<{
        coverImage: string | null;
        title: string;
        slug: string;
        content: string;
        excerpt: string;
        authorId: string | null;
        tags: string[];
        status: string;
        metaTitle: string | null;
        metaDescription: string | null;
        openGraphImage: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        coverImage: string | null;
        title: string;
        slug: string;
        content: string;
        excerpt: string;
        authorId: string | null;
        tags: string[];
        status: string;
        metaTitle: string | null;
        metaDescription: string | null;
        openGraphImage: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
