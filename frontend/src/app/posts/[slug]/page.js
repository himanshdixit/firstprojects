import PostDetail from '@/components/post/PostDetail';

export default function PostDetailPage({ params }) {
  return <PostDetail slug={params.slug} />;
}
