export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://gemstudio.app';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app/', '/account/', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
