import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import chatHandler from './api/chat.js';
import citasHandler from './api/citas.js';
import historialHandler from './api/historial.js';
import medicosHandler from './api/medicos.js';

function vercelApiDevPlugin() {
  return {
    name: 'vercel-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;

        if (pathname.startsWith('/api/')) {
          // Parsear query parameters en req.query
          const query = Object.fromEntries(url.searchParams.entries());
          req.query = query;

          // Helper para parsear JSON en el body si es POST/PUT/PATCH/DELETE
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            let body = '';
            for await (const chunk of req) {
              body += chunk;
            }
            try {
              req.body = body ? JSON.parse(body) : {};
            } catch {
              req.body = {};
            }
          }

          // Polyfill de res.status().json() como en Vercel Serverless
          const originalEnd = res.end.bind(res);
          res.status = function (code) {
            res.statusCode = code;
            return res;
          };
          res.json = function (data) {
            res.setHeader('Content-Type', 'application/json');
            return originalEnd(JSON.stringify(data));
          };

          try {
            if (pathname === '/api/chat') {
              return await chatHandler(req, res);
            }
            if (pathname === '/api/citas') {
              return await citasHandler(req, res);
            }
            if (pathname === '/api/historial') {
              return await historialHandler(req, res);
            }
            if (pathname === '/api/medicos') {
              return await medicosHandler(req, res);
            }
          } catch (err) {
            console.error('Error en API dev:', err);
            return res.status(500).json({ error: err.message });
          }
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), vercelApiDevPlugin()],
  server: {
    port: 3000
  }
});
