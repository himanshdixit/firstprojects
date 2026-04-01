import { notFound } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import PostDetail from '@/components/post/PostDetail';
import { getPostCover } from '@/lib/media';
import { buildArticleJsonLd, buildExcerpt, absoluteUrl } from '@/lib/seo';
import { getServerPostBySlug } from '@/lib/serverPosts';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const post = await getServerPostBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'This story is no longer available.',
    };
  }

  const title = post.title;
  const description = buildExcerpt(post.content, 180) || 'Read this story on DraftSphere.';
  const image = getPostCover(post);
  const url = absoluteUrl(`/posts/${post.slug || params.slug}`);

  return {
    title,
    description,
    keywords: post.tags || [],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt || post.createdAt,
      section: post.category || undefined,
      authors: post.author?.name ? [post.author.name] : undefined,
      tags: post.tags || [],
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PostDetailPage({ params }) {
  const post = await getServerPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildArticleJsonLd(post)} />
      <PostDetail post={post} />
    </>
  );
}
