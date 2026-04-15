const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());

// Diagnostic Logging Middleware
app.use((req, res, next) => {
  console.log(`[API GATEWAY] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Define routes and their target microservices
const routes = {
  '/api/patients': 'http://localhost:3001',
  '/api/doctors': 'http://localhost:3002',
  '/api/appointments': 'http://localhost:3003',
  '/api/notify': 'http://localhost:3004',
  '/api/payment': 'http://localhost:3005',
  '/api/admin': 'http://localhost:3006',
  '/api/telemedicine': 'http://localhost:3007',
  '/api/auth': 'http://localhost:3008',
  '/api/symptoms': 'http://localhost:3009'
};

// Set up proxy middleware for each route
for (const [route, target] of Object.entries(routes)) {
  app.use(route, createProxyMiddleware({
    target,
    changeOrigin: true,
    // Preserve the full original path to avoid 404s in microservices
    pathRewrite: (path, req) => req.originalUrl
  }));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'api-gateway' });
});

const PORT = 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Proxying the following services (Verified IP Routing):');
  Object.keys(routes).forEach(route => {
    console.log(`  🔗 ${route} -> ${routes[route]}`);
  });
});
