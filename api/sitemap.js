import { supabase } from './_utils/supabase.js';

export default async function handler(req, res) {
  const baseUrl = 'https://www.wishnest.co.in';

  try {
    // 1. Fetch all public wishlists
    const { data: wishlists, error } = await supabase
      .from('wishlists')
      .select('id, updated_at')
      .or('is_public.eq.true,visibility.eq.public')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Sitemap fetch error:', error);
      throw error;
    }

    // 2. Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/signup</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/discover</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;

    // 3. Add dynamic wishlist URLs
    if (Array.isArray(wishlists)) {
      wishlists.forEach(wl => {
        const lastMod = wl.updated_at ? wl.updated_at.split('T')[0] : '2026-04-20';
        xml += `
  <url>
    <loc>${baseUrl}/wishlist/${wl.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });
    }

    xml += '\n</urlset>';

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).send(xml);
  } catch (err) {
    console.error('Sitemap generation failed:', err);
    res.status(500).send('Error generating sitemap');
  }
}
