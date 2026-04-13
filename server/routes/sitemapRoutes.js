import express from 'express';
import Wishlist from '../models/Wishlist.js';

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
  try {
    // Fetch all public wishlists
    const wishlists = await Wishlist.find({
      $or: [
        { isPublic: true },
        { visibility: 'public' }
      ]
    }).select('_id updatedAt').lean();

    const baseUrl = 'https://wishnest.co.in';

    // Build the static base URL blocks
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
    <loc>${baseUrl}/wishnest-preview</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;

    // Add dynamic wishlist URLs
    wishlists.forEach(w => {
      // Use updatedAt if available, otherwise current date
      const lastModDate = w.updatedAt ? new Date(w.updatedAt) : new Date();
      const lastMod = lastModDate.toISOString().split('T')[0];
      
      xml += `
  <url>
    <loc>${baseUrl}/wishlist/${w._id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap generation error:', err);
    res.status(500).end();
  }
});

export default router;
