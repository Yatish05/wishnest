import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

function apiDevPlugin() {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api') && req.url !== '/sitemap.xml') {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host || 'localhost:5173'}`);
        req.query = Object.fromEntries(url.searchParams.entries());

        if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.body) {
          const buffers = [];
          for await (const chunk of req) buffers.push(chunk);
          const raw = Buffer.concat(buffers).toString();
          try {
            req.body = raw ? JSON.parse(raw) : {};
          } catch {
            req.body = {};
          }
        } else if (!req.body) {
          req.body = {};
        }

        if (!res.status) {
          res.status = (statusCode) => {
            res.statusCode = statusCode;
            return res;
          };
        }
        if (!res.json) {
          res.json = (data) => {
            if (!res.getHeader('Content-Type')) {
              res.setHeader('Content-Type', 'application/json');
            }
            res.end(JSON.stringify(data));
            return res;
          };
        }
        if (!res.redirect) {
          res.redirect = (redirectUrl) => {
            res.statusCode = 302;
            res.setHeader('Location', redirectUrl);
            res.end();
            return res;
          };
        }

        try {
          let handlerModule;
          if (req.url.startsWith('/api/auth')) {
            handlerModule = await server.ssrLoadModule('./api/auth.js');
          } else if (req.url.startsWith('/api/wishlists/public')) {
            const id = req.url.split('/public/')[1]?.split('?')[0];
            req.query.id = id;
            handlerModule = await server.ssrLoadModule('./api/public-wishlist.js');
          } else if (req.url.startsWith('/api/wishlists')) {
            handlerModule = await server.ssrLoadModule('./api/wishlists.js');
          } else if (req.url.startsWith('/api/discover')) {
            handlerModule = await server.ssrLoadModule('./api/discover.js');
          } else if (req.url.startsWith('/api/notifications')) {
            handlerModule = await server.ssrLoadModule('./api/notifications.js');
          } else if (req.url.startsWith('/api/public-wishlist')) {
            handlerModule = await server.ssrLoadModule('./api/public-wishlist.js');
          } else if (req.url.startsWith('/api/search')) {
            handlerModule = await server.ssrLoadModule('./api/search.js');
          } else if (req.url.startsWith('/api/health')) {
            handlerModule = await server.ssrLoadModule('./api/health.js');
          } else if (req.url.startsWith('/api/db-check')) {
            handlerModule = await server.ssrLoadModule('./api/db-check.js');
          } else if (req.url === '/sitemap.xml') {
            handlerModule = await server.ssrLoadModule('./api/sitemap.js');
          }

          if (handlerModule && handlerModule.default) {
            const result = await handlerModule.default(req, res);
            if (result instanceof Response) {
              res.statusCode = result.status;
              result.headers.forEach((val, key) => res.setHeader(key, val));
              const text = await result.text();
              res.end(text);
            }
            return;
          }
        } catch (err) {
          console.error('[API Dev Plugin Error]:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), apiDevPlugin()],
});
