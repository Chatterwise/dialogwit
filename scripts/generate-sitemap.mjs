import { writeFile } from 'node:fs/promises'

// Supported languages (keep in sync with src/lib/languages.ts)
const languages = ['en', 'es', 'de', 'hu']

// Public, unauthenticated routes (without lang prefix)
const basePaths = [
  '/',
  '/pricing',
  '/features',
  '/documentation',
  '/api-reference',
  '/enterprise',
  '/community',
  '/about',
  '/contact',
  '/legal',
  // docs subsections
  '/docs/getting-started',
  '/docs/advanced-features',
  '/docs/tutorials',
  '/docs/getting-started/introduction',
  '/docs/getting-started/first-chatbot',
  '/docs/getting-started/knowledge-base',
  '/docs/getting-started/training-chatbot',
  '/docs/integrations/website-integration',
  '/docs/integrations/slack-integration',
  '/docs/integrations/discord-integration',
  '/docs/integrations/wordpress-integration',
  '/docs/advanced-features/custom-templates',
  '/docs/advanced-features/webhooks',
  '/docs/advanced-features/security-best-practices',
  '/docs/tutorials/customer-support-bot',
]

const origin = process.env.SITEMAP_ORIGIN || 'https://chatterwise.io'
const lastmod = new Date().toISOString().slice(0, 10)

const urls = []
for (const lang of languages) {
  for (const p of basePaths) {
    const loc = `${origin}/${lang}${p === '/' ? '' : p}`
    urls.push({ loc, changefreq: 'weekly', priority: p === '/' ? '1.0' : '0.7' })
  }
}

const xmlItems = urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlItems}
</urlset>
`

await writeFile('public/sitemap.xml', xml, 'utf8')
console.log(`Sitemap generated with ${urls.length} entries -> public/sitemap.xml`)

