# Healthcare Microservices Platform

A comprehensive healthcare system built with a microservices architecture, featuring patient management, doctor services, appointment scheduling, telemedicine, and payment processing.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Services](#services)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Contributing](#contributing)

## Overview

This is a full-stack healthcare application that enables:
- **Patient Management**: Register, manage patient profiles and medical records
- **Doctor Services**: Doctor profiles, prescriptions, and availability management
- **Appointment Booking**: Schedule and manage appointments between patients and doctors
- **Telemedicine**: Video consultation capabilities for remote consultations
- **Payment Processing**: Secure payment handling for consultations and services
- **Notifications**: Real-time notifications for appointments and updates
- **Admin Dashboard**: Administrative controls and system management
- **AI Symptom Checker**: Intelligent symptom analysis

## Architecture

The application follows a **microservices architecture** with:

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│              (Runs on http://localhost:5173)                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              API Gateway (Express.js)                        │
│              (Runs on http://localhost:5000)                 │
└──────────┬────────┬────────┬────────┬────────┬────────┬──────┘
           │        │        │        │        │        │
      ┌────▼────┐   │   ┌────▼────┐  │   ┌────▼────┐   │
      │  Auth   │   │   │ Patient  │  │   │ Doctor  │   │
      │ Service │   │   │ Service  │  │   │ Service │   │
      │ :3008   │   │   │  :3001   │  │   │  :3002  │   │
      └─────────┘   │   └──────────┘  │   └─────────┘   │
                    │                 │
            ┌───────▼──────┐  ┌───────▼──────┐
            │  Appointment │  │  Notification│
            │   Service    │  │   Service    │
            │   :3003      │  │    :3004     │
            └──────────────┘  └──────────────┘
                    │                 │
         ┌──────────▼────────┬────────▼──────────┐
         │   Payment Service │  Admin Service    │
         │       :3005       │      :3006        │
         └───────────────────┴───────────────────┘
                    │
         ┌──────────▼────────────────┐
         │  Telemedicine Service     │
         │         :3007             │
         └───────────────────────────┘
```

**Data Layer**: MongoDB (shared database for all services)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** (v6.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - Or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud database)
- **Docker Desktop** (optional, recommended for running the full stack with Compose)
- **Git** - [Download](https://git-scm.com/)

### Verify Installation

```bash
node --version      # Should be v18+
npm --version       # Should be v8+
mongod --version    # Should be v6+
```

## Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Health\ Care\ -\ Microservices
```

### 2. Install Dependencies

#### Backend Services

```bash
# Install API Gateway dependencies
cd Backend-NodeJS/api-gateway
npm install

# Install each microservice
cd ../services

# Auth Service
cd auth-service && npm install && cd ..

# Patient Service
cd patient-service && npm install && cd ..

# Doctor Service
cd doctor-service && npm install && cd ..

# Appointment Service
cd appointment-service && npm install && cd ..

# Notification Service
cd notification-service && npm install && cd ..

# Payment Service
cd payment-service && npm install && cd ..

# Admin Service
cd admin-service && npm install && cd ..

# Telemedicine Service
cd telemedicine-service && npm install && cd ..

cd ../../../
```

#### Frontend

```bash
cd Frontend-React
npm install
cd ..
```

### 3. Configure Environment Variables

This repo supports two run modes:

1) **Local dev** (run services with `node server.js` / `npm run dev`)
- Create a `.env` file in each service directory by copying from its `.env.example`.
- Use `mongodb://localhost:27017/...` and `http://localhost:<port>` for service URLs.

2) **Docker Compose** (run everything with `docker compose`)
- Create a `.env.docker` file in each service directory by copying from its `.env.example`.
- Use Compose DNS names for service URLs (NOT `localhost`), e.g. `http://auth-service:3008`.
- For Mongo, use `mongodb://mongo:27017/...`.

Notes:
- Prefer `MONGO_URI` (some services also accept `MONGODB_URI` for compatibility).
- `JWT_SECRET` should be consistent across services.

Frontend config:
- [Frontend-React/.env.example](./Frontend-React/.env.example) shows the required `VITE_API_URL`.
- For local + Docker Compose on your machine, the frontend typically uses:
  `VITE_API_URL=http://localhost:5000`

## Running the Application

### Option 0: Run All Services with Docker Compose (Recommended)

From the repository root:

```bash
docker compose up -d --build
```

Check status:

```bash
docker compose ps
```

Stop everything (keeps volumes/data):

```bash
docker compose down
```

Stop and wipe volumes (you will need to re-register users):

```bash
docker compose down -v
```

URLs:
- Frontend: http://localhost:5173
- API Gateway: http://localhost:5000

Compose service names (as defined in [docker-compose.yml](./docker-compose.yml)):
- mongo
- auth-service
- patient-service
- doctor-service
- appointment-service
- notification-service
- payment-service
- telemedicine-service
- admin-service
- ai-symptom-checker
- api-gateway
- frontend

### Option 1: Run Services Individually (Development)

#### Terminal 1 - Start MongoDB

```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### Terminal 2 - Start API Gateway

```bash
cd Backend-NodeJS/api-gateway
node server.js
# Gateway running on http://localhost:5000
```

#### Terminal 3+ - Start Each Microservice

```bash
# Auth Service
cd Backend-NodeJS/services/auth-service
node server.js

# Patient Service (in another terminal)
cd Backend-NodeJS/services/patient-service
node server.js

# Doctor Service (in another terminal)
cd Backend-NodeJS/services/doctor-service
node server.js

# And so on for other services...
```

#### Terminal - Start React Frontend

```bash
cd Frontend-React
npm run dev
# Frontend running on http://localhost:5173
```

### Option 2: Run All Services with Docker Compose (Recommended for Production)

```bash
docker compose up -d --build
```

See [docker-compose.yml](./docker-compose.yml) for configuration.

### Option 3: Quick Start Script (Recommended for Development)

```bash
# Run all services in one go
npm run start:all
```

## Project Structure

```
Health Care - Microservices/
│
├── Backend-NodeJS/
│   ├── api-gateway/
│   │   ├── server.js
│   │   ├── package.json
│   │   └── .env
│   │
│   └── services/
│       ├── auth-service/
│       ├── patient-service/
│       ├── doctor-service/
│       ├── appointment-service/
│       ├── notification-service/
│       ├── payment-service/
│       ├── admin-service/
│       ├── telemedicine-service/
│       └── AI-symptom-checker/
│
├── Frontend-React/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── README.md (this file)
├── docker-compose.yml
└── .gitignore
```

## Services

### Auth Service (Port 3008)
- User registration and authentication
- JWT token generation
- Password hashing with bcryptjs
- **Base URL**: `http://localhost:5000/api/auth`

### Patient Service (Port 3001)
- Patient profile management
- Medical history
- Medical reports upload
- **Base URL**: `http://localhost:5000/api/patients`

### Doctor Service (Port 3002)
- Doctor profiles and specializations
- Prescriptions management
- Availability scheduling
- **Base URL**: `http://localhost:5000/api/doctors`

### Appointment Service (Port 3003)
- Appointment booking
- Appointment scheduling and rescheduling
- Appointment history
- **Base URL**: `http://localhost:5000/api/appointments`

### Notification Service (Port 3004)
- Real-time notifications
- Appointment reminders
- Email notifications
- **Base URL**: `http://localhost:5000/api/notify`

### Payment Service (Port 3005)
- Payment processing
- Transaction history
- Invoice management
- **Base URL**: `http://localhost:5000/api/payment`

### Admin Service (Port 3006)
- System administration
- User management
- Analytics and reporting
- **Base URL**: `http://localhost:5000/api/admin`

### Telemedicine Service (Port 3007)
- Video consultation sessions
- Session recording
- Chat functionality
- **Base URL**: `http://localhost:5000/api/telemedicine`

## API Documentation

### Health Check

```bash
curl http://localhost:5000/health
```

### Authentication

All services (except auth) require JWT token in headers:

```bash
Authorization: Bearer <your_jwt_token>
```

For detailed API endpoints, refer to each service's `routes/` directory or access Swagger documentation at:
- `http://localhost:5000/api-docs` (when deployed)

## Development

### Running Tests

```bash
# Run tests for a service
cd Backend-NodeJS/services/auth-service
npm test
```

### Linting

```bash
# Frontend
cd Frontend-React
npm run lint

# Fix linting issues
npm run lint -- --fix
```

### Building for Production

```bash
# Frontend
cd Frontend-React
npm run build
# Output: dist/

# Backend services (already in production mode)
# Just run: npm start (instead of npm run dev)
```

### Database Seeding

```bash
# Seed admin user
cd Backend-NodeJS/services/admin-service
node scripts/seedAdmin.js
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

Please follow the existing code style and add tests for new features.

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env` files
- For Atlas, use connection string: `mongodb+srv://username:password@cluster.mongodb.net/database`

### Port Already in Use
- Change the port in `.env` file
- Or kill the process: `lsof -i :3001` (find process, then `kill -9 <pid>`)

### CORS Errors
- Check API Gateway CORS configuration in `api-gateway/server.js`
- Ensure frontend `VITE_API_URL` matches gateway URL

### Services Not Connecting
- Verify all services are running on correct ports
- Check firewall settings
- Review service logs for errors

---

**Last Updated**: March 2026
**Version**: 1.0.0
