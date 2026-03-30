const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());

// Define routes and their target microservices
const routes = {
  '/api/patients': 'http://localhost:3001',
  '/api/doctors': 'http://localhost:3002',
  '/api/appointments': 'http://localhost:3003',
  '/api/notify': 'http://localhost:3004',
  '/api/payment': 'http://localhost:3005',
  '/api/admin': 'http://localhost:3006',
  '/api/telemedicine': 'http://localhost:3007',
  '/api/auth': 'http://localhost:3008'
};

// Set up proxy middleware for each route
for (const route in routes) {
  const target = routes[route];
  app.use(route, createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path, req) => req.originalUrl
  }));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'api-gateway' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
  console.log('Proxying the following services:');
  Object.keys(routes).forEach(route => {
    console.log(`  ${route} -> ${routes[route]}`);
  });
});
