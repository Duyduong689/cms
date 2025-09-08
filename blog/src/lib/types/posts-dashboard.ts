export type PostStatus = 'draft' | 'published';

export interface PostListItem {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  updatedAt: string;
}

export interface PostStats {
  posts: number;
  published: number;
  drafts: number;
}


