import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { QueryPostDto } from './dto/query-post.dto';
import { JwtPayload } from '../common/utils/token.util';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    create(createPostDto: CreatePostDto, user: JwtPayload): Promise<{
        id: string;
        title: string;
        slug: string;
        content: string;
        excerpt: string;
        coverImage: string | null;
        authorId: string | null;
        tags: string[];
        status: string;
        metaTitle: string | null;
        metaDescription: string | null;
        openGraphImage: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(query: QueryPostDto): Promise<unknown>;
    findOne(id: string): Promise<unknown>;
    update(id: string, updatePostDto: UpdatePostDto, user: JwtPayload): Promise<{
        id: string;
        title: string;
        slug: string;
        content: string;
        excerpt: string;
        coverImage: string | null;
        authorId: string | null;
        tags: string[];
        status: string;
        metaTitle: string | null;
        metaDescription: string | null;
        openGraphImage: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, user: JwtPayload): Promise<{
        id: string;
        title: string;
        slug: string;
        content: string;
        excerpt: string;
        coverImage: string | null;
        authorId: string | null;
        tags: string[];
        status: string;
        metaTitle: string | null;
        metaDescription: string | null;
        openGraphImage: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
