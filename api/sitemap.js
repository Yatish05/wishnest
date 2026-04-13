import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env');
}

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  const client = await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;

    const wishlists = await db.collection('wishlists').find({
      $or: [{ isPublic: true }, { visibility: 'public' }],
    }).project({ _id: 1, updatedAt: 1 }).toArray();

    const baseUrl = 'https://wishnest.co.in';

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

    wishlists.forEach((w) => {
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

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap API Error:', error);
    res.status(500).send('Internal Server Error');
  }
}
