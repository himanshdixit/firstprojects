import { absoluteUrl } from '@/lib/seo';
import { getServerPublishedPosts } from '@/lib/serverPosts';

export default async function sitemap() {
  const posts = await getServerPublishedPosts(200).catch(() => []);

  const staticEntries = [
    {
      url: absoluteUrl('/'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absoluteUrl('/login'),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/register'),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  const postEntries = posts
    .filter((post) => post?.slug)
    .map((post) => ({
      url: absoluteUrl(`/posts/${post.slug}`),
      lastModified: post.updatedAt || post.createdAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  return [...staticEntries, ...postEntries];
}
