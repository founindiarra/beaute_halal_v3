/**
 * Génère public/robots.txt et public/sitemap.xml selon l'environnement.
 *
 *  - robots.txt autorise toujours l'exploration : pour NE PAS être indexé, le site
 *    pose « noindex » dans chaque page (VITE_ALLOW_INDEXING=false). Un « Disallow »
 *    empêcherait justement les moteurs de lire ce noindex.
 *  - sitemap.xml n'est produit que si l'indexation est autorisée ET que
 *    VITE_SITE_URL est renseignée (un sitemap exige des URL absolues).
 */
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

function readEnvFile(name) {
  const file = resolve(process.cwd(), name)
  if (!existsSync(file)) return {}
  const out = {}
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
  return out
}

const env = {
  ...readEnvFile('.env.production'),
  ...readEnvFile('.env.production.local'),
  ...readEnvFile('.env.local'),
  ...readEnvFile('.env'),
  ...Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith('VITE_'))),
}

const site = (env.VITE_SITE_URL || '').replace(/\/+$/, '')
const indexing = String(env.VITE_ALLOW_INDEXING).toLowerCase() === 'true'
const paths = ['/', '/services', '/galerie', '/a-propos', '/rendez-vous', '/contact']
const sitemapFile = resolve(process.cwd(), 'public/sitemap.xml')

let robots = 'User-agent: *\nAllow: /\n'
if (indexing && site) {
  robots += `\nSitemap: ${site}/sitemap.xml\n`
  const urls = paths
    .map((p) => `  <url><loc>${site}${p}</loc><priority>${p === '/' ? '1.0' : '0.7'}</priority></url>`)
    .join('\n')
  writeFileSync(
    sitemapFile,
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  )
} else if (existsSync(sitemapFile)) {
  unlinkSync(sitemapFile)
}
writeFileSync(resolve(process.cwd(), 'public/robots.txt'), robots)
console.log(
  `[seo] indexation ${indexing ? 'autorisée' : 'désactivée (noindex)'} — sitemap ${indexing && site ? 'généré' : 'non généré'}`,
)
