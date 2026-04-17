const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());

app.use((req, res, next) => {
  console.log(`[API GATEWAY] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const base = (u) => (u || '').replace(/\/$/, '');

// Define routes and their target microservices (set these via environment variables)
const routes = {
  '/api/patients': base(process.env.PATIENT_SERVICE_URL),
  '/api/doctors': base(process.env.DOCTOR_SERVICE_URL),
  '/api/appointments': base(process.env.APPOINTMENT_SERVICE_URL),
  '/api/notify': base(process.env.NOTIFICATION_SERVICE_URL),
  '/api/payment': base(process.env.PAYMENT_SERVICE_URL),
  '/api/admin': base(process.env.ADMIN_SERVICE_URL),
  '/api/telemedicine': base(process.env.TELEMEDICINE_SERVICE_URL),
  '/api/auth': base(process.env.AUTH_SERVICE_URL),
  '/api/symptoms': base(process.env.SYMPTOM_SERVICE_URL),
};

// Set up proxy middleware for each route (skip routes without a configured target)
for (const [route, target] of Object.entries(routes)) {
  if (!target) {
    console.warn(`[API GATEWAY] Missing target for ${route}. Set the appropriate *_SERVICE_URL env var.`);
    continue;
  }

  app.use(
    route,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      // Preserve the full original path to avoid 404s in microservices
      pathRewrite: (path, req) => req.originalUrl,
    }),
  );
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'api-gateway' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
  console.log('Proxying the following services:');
  Object.keys(routes).forEach((route) => {
    console.log(`  ${route} -> ${routes[route] || '(not configured)'}`);
  });
});
