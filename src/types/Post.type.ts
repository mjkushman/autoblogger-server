// todo: updates types to reference Models

export type Post = {
  postId: string;
  accountId: string;
  authorId?: string
  title: string;
  content: string;
  imageUrl: string;
  slug: string;
  isPublished: boolean,
  createdAt: Date;
  updatedAt: Date;
  comments?: any[];
  account?: any;
};
