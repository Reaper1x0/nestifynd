# NestifyND

<div align="center">

### AI-powered routine and wellness platform

Build habits, track progress, gamify consistency, and support collaboration across users, therapists, caregivers, and admins.

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Surface](#api-surface)
- [Core User Flows](#core-user-flows)
- [Deployment Notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Overview

NestifyND is a full-stack MERN application designed to help users build sustainable routines with support from AI guidance, gamification, and role-based collaboration.

This repository contains:

- `Frontend` - React + Vite client application
- `API` - Express + MongoDB backend services

The platform includes routine management, role-based dashboards, AI features, notifications, reporting, and payment-ready infrastructure.

---

## Key Features

- **Role-based access control** for users, therapists, caregivers, and admins
- **Routine builder** with templates, reminders, and scheduling options
- **Gamification engine** with badges, challenges, streaks, and points
- **AI-assisted experiences** for routine support and chat interactions
- **Progress dashboards** for activity, trends, and user insights
- **In-app messaging and notifications** for ongoing engagement
- **Subscription/payment integration** support with Stripe endpoints
- **Interactive API documentation** using Swagger (`/api-docs`)

---

## Tech Stack

### Frontend (`Frontend`)

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Framer Motion
- D3 + Recharts

### Backend (`API`)

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Swagger (`swagger-jsdoc`, `swagger-ui-express`)
- OpenAI SDK
- Twilio + SendGrid/Nodemailer integrations
- Stripe SDK

---

## Project Structure

```text
nestifynd/
├── API/                  # Backend (Express + MongoDB)
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── utils/
│   ├── server.js
│   └── package.json
└── Frontend/             # Frontend (React + Vite)
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   ├── styles/
    │   └── Routes.jsx
    ├── vite.config.mjs
    └── package.json
```

---

## Quick Start

### 1) Clone the repository

```bash
git clone <your-repository-url>
cd nestifynd
```

### 2) Install dependencies

```bash
cd API && npm install
cd ../Frontend && npm install
```

### 3) Configure environment variables

Create:

- `API/.env`
- `Frontend/.env` (if your frontend config requires runtime variables)

See [Environment Variables](#environment-variables) for a starter template.

### 4) Run backend and frontend

In terminal A:

```bash
cd API
npm run dev
```

In terminal B:

```bash
cd Frontend
npm start
```

Default local URLs:

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000`
- Swagger docs: `http://localhost:5000/api-docs`

---

## Environment Variables

Minimum backend setup in `API/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

Depending on enabled features, backend services may also require keys for:

- OpenAI
- Stripe
- Twilio
- SendGrid / SMTP mail provider

Use placeholder values in development and real secrets in your deployment environment.

---

## Available Scripts

### Backend (`API`)

- `npm start` - run server with Node
- `npm run dev` - run server with Nodemon

### Frontend (`Frontend`)

- `npm start` - start Vite dev server
- `npm run build` - production build
- `npm run serve` - preview production build

---

## API Surface

The backend exposes grouped REST endpoints under `/api/*`.

Main route groups include:

- `/api/auth`
- `/api/routines`
- `/api/tasks`
- `/api/templates`
- `/api/dashboard`
- `/api/gamification`
- `/api/messages`
- `/api/notifications`
- `/api/ai`
- `/api/admin`
- `/api/reports`
- `/api/stripe`
- `/api/plans`
- `/api/therapists`

Explore full endpoint contracts at: `http://localhost:5000/api-docs`

---

## Core User Flows

- **Authentication & onboarding**: register/login, role routing, protected pages
- **Routine lifecycle**: create routine, configure tasks/schedule/reminders, monitor completion
- **Engagement loop**: complete tasks, earn points/badges, maintain streaks
- **Collaboration**: therapist/caregiver oversight and support dashboards
- **AI assistance**: generate or improve routine plans and chat for motivation

---

## Deployment Notes

- Deploy frontend and backend independently (recommended)
- Use managed MongoDB (Atlas) for production
- Configure CORS via `FRONTEND_URL`
- Store secrets in your cloud provider’s secure environment settings
- Run backend seeding logic with caution in production environments

---

## Troubleshooting

- **MongoDB connection fails**: verify `MONGO_URI` and network/IP allowlist
- **CORS issues**: ensure frontend origin matches backend `FRONTEND_URL` / allowed origins
- **401/403 responses**: check JWT flow and role permissions
- **Missing AI/payment features**: verify external service credentials are set

---

## Contributing

1. Create a feature branch
2. Keep changes focused and documented
3. Test frontend and backend flows locally
4. Open a pull request with context, screenshots (if UI), and test notes

---

Built with care by the NestifyND team.
