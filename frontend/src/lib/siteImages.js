function unsplash(id, width = 1440, height = 960) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&h=${height}&q=72`;
}

export function stableVisualIndex(seed, length) {
  const input = String(seed || '');
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash) % length;
}

export const HERO_SLIDES = [
  {
    id: 'atelier',
    image: unsplash('photo-1455390582262-044cdead277a'),
    alt: 'Luxury writing desk with notebook, pen, and warm editorial lighting',
    eyebrow: 'DraftSphere Atelier',
    title: 'Stories deserve atmosphere, not generic templates.',
    description:
      'Publish essays, journals, and polished long-form work inside an editorial environment shaped by restraint, clarity, and modern luxury.',
    ctaLabel: 'Start Writing',
    ctaHref: '/create-post',
  },
  {
    id: 'reading-room',
    image: unsplash('photo-1499750310107-5fef28a66643'),
    alt: 'Elegant creative studio desk with notebook, flowers, and editorial planning tools',
    eyebrow: 'Refined Workflow',
    title: 'A publishing rhythm designed for creators with taste.',
    description:
      'Draft, curate, and present your work with premium spacing, dark-mode calm, and a reading experience that feels considered on every screen.',
    ctaLabel: 'Explore Stories',
    ctaHref: '/',
  },
  {
    id: 'modern-studio',
    image: unsplash('photo-1517430816045-df4b7de11d1d'),
    alt: 'Modern workspace with laptop and moody lighting for digital publishing',
    eyebrow: 'Modern Editorial Tech',
    title: 'Clean product thinking meets timeless editorial design.',
    description:
      'From author profiles to moderation tools, DraftSphere pairs product-grade workflows with the visual confidence of a high-end magazine.',
    ctaLabel: 'View Admin Suite',
    ctaHref: '/admin',
  },
  {
    id: 'story-archive',
    image: unsplash('photo-1512820790803-83ca734da794'),
    alt: 'Curated stack of books and printed reading materials in a soft studio setting',
    eyebrow: 'Built for Reading',
    title: 'Turn each post into a collectible reading moment.',
    description:
      'Use rich visuals, strong hierarchy, and purposeful metadata to make every article feel more like an issue worth returning to.',
    ctaLabel: 'Learn About DraftSphere',
    ctaHref: '/about',
  },
];

export const FEATURED_EDITORIAL_PANELS = [
  {
    id: 'craft',
    image: unsplash('photo-1455390582262-044cdead277a', 1400, 1100),
    alt: 'Writer drafting thoughtful long-form content at a premium workspace',
    eyebrow: 'Writing Craft',
    title: 'Long-form writing with an editorial point of view',
    description:
      'Thoughtful essays, journals, and perspective pieces deserve room to breathe. DraftSphere gives them that space.',
    href: '/?category=writing',
    ctaLabel: 'Browse craft stories',
  },
  {
    id: 'product',
    image: unsplash('photo-1516321318423-f06f85e504b3', 1400, 1100),
    alt: 'Modern team discussing product and content strategy around a laptop',
    eyebrow: 'Product & Systems',
    title: 'Publishing workflows that feel more like a premium SaaS product',
    description:
      'Admin panels, analytics, and structured content tools are presented with the same polish as the front-facing reading experience.',
    href: '/admin',
    ctaLabel: 'See the dashboard',
  },
  {
    id: 'culture',
    image: unsplash('photo-1512820790803-83ca734da794', 1400, 1100),
    alt: 'Minimal reading corner with books and soft ambient light',
    eyebrow: 'Culture & Reading',
    title: 'A visual language that supports thoughtful reading',
    description:
      'Warm paper tones, serif typography, and curated imagery give the platform a collector-quality editorial feel.',
    href: '/about',
    ctaLabel: 'Why it feels different',
  },
];

export const CATEGORY_SPOTLIGHTS = [
  {
    key: 'writing',
    image: unsplash('photo-1499750310107-5fef28a66643', 1200, 900),
    alt: 'Notebook and coffee on a carefully arranged writing desk',
    title: 'Writing',
    description: 'Essays, journals, and publishing craft.',
    href: '/?category=writing',
  },
  {
    key: 'technology',
    image: unsplash('photo-1461749280684-dccba630e2f6', 1200, 900),
    alt: 'Laptop and code editor in a clean modern workstation',
    title: 'Technology',
    description: 'Engineering, tools, and digital product notes.',
    href: '/?category=technology',
  },
  {
    key: 'design',
    image: unsplash('photo-1484417894907-623942c8ee29', 1200, 900),
    alt: 'Design workspace with keyboard, planner, and premium desk accessories',
    title: 'Design',
    description: 'Brand, interface, and visual thinking.',
    href: '/?category=design',
  },
  {
    key: 'culture',
    image: unsplash('photo-1512820790803-83ca734da794', 1200, 900),
    alt: 'Stack of books and reading materials styled in a calm luxury setting',
    title: 'Culture',
    description: 'Reading lists, ideas, and editorial mood.',
    href: '/?category=culture',
  },
];

export const ABOUT_VISUALS = {
  hero: {
    image: unsplash('photo-1455390582262-044cdead277a', 1600, 1200),
    alt: 'DraftSphere editorial workspace with notebook, pen, and warm mood lighting',
  },
  collage: [
    {
      id: 'collage-1',
      image: unsplash('photo-1499750310107-5fef28a66643', 900, 1100),
      alt: 'Minimal editorial studio arrangement with notebook and soft styling',
    },
    {
      id: 'collage-2',
      image: unsplash('photo-1517430816045-df4b7de11d1d', 900, 1100),
      alt: 'Contemporary publishing workspace with laptop and ambient light',
    },
  ],
};

export const CONTACT_VISUAL = {
  image: unsplash('photo-1516321318423-f06f85e504b3', 1600, 1200),
  alt: 'Editorial team conversation and premium contact desk environment',
};

const POST_IMAGE_RULES = [
  {
    keywords: ['writing', 'journal', 'essay', 'author', 'story', 'copy', 'editorial'],
    image: unsplash('photo-1455390582262-044cdead277a', 1400, 1000),
  },
  {
    keywords: ['technology', 'engineering', 'code', 'developer', 'software', 'api', 'backend'],
    image: unsplash('photo-1461749280684-dccba630e2f6', 1400, 1000),
  },
  {
    keywords: ['design', 'ux', 'ui', 'brand', 'visual', 'creative'],
    image: unsplash('photo-1484417894907-623942c8ee29', 1400, 1000),
  },
  {
    keywords: ['product', 'business', 'marketing', 'strategy', 'startup', 'management'],
    image: unsplash('photo-1516321318423-f06f85e504b3', 1400, 1000),
  },
  {
    keywords: ['culture', 'books', 'reading', 'literature', 'creativity', 'mindset'],
    image: unsplash('photo-1512820790803-83ca734da794', 1400, 1000),
  },
];

export const DEFAULT_POST_IMAGES = POST_IMAGE_RULES.map((rule) => rule.image);

export function getCuratedPostImage(post) {
  const searchable = [
    post?.category,
    ...(Array.isArray(post?.tags) ? post.tags : []),
    post?.title,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const rule = POST_IMAGE_RULES.find(({ keywords }) =>
    keywords.some((keyword) => searchable.includes(keyword))
  );

  if (rule) {
    return rule.image;
  }

  const idx = stableVisualIndex(
    post?._id || post?.slug || post?.title || searchable,
    DEFAULT_POST_IMAGES.length
  );
  return DEFAULT_POST_IMAGES[idx];
}
