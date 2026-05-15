# SPIT — Smart Passenger Interactive Transit 🚆🌍

![SPIT Platform Banner](https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2000&h=600)

> A next-generation, high-fidelity social transit platform built for passengers traveling to and within Tunisia. 

SPIT merges robust travel management with a highly dynamic, real-time social ecosystem. Connect with fellow passengers, share travel experiences, manage roles interactively, and get instant assistance via our AI-powered travel bot.

---

## 🌟 Key Features

*   **Interactive Social Feed**: Real-time posts, comments, and nested replies synchronized via WebSockets (STOMP).
*   **Premium Glassmorphism UI**: Dynamic Light & Dark modes featuring fluid `cubic-bezier` transitions, responsive grid layouts, and kinetic micro-animations.
*   **AI Chat Assistant**: Integrated Llama 3.3 (via Groq Cloud) providing instant, contextual travel support to passengers.
*   **Real-time Notifications**: Instant alerts for likes, comments, and follows without page refreshes.
*   **Admin Dashboard**: Comprehensive RBAC (Role-Based Access Control) to manage passengers, moderate content, and oversee the platform.

---

## 🛠️ Technology Stack

### Frontend
*   **Framework**: React (Vite)
*   **Styling**: Pure CSS3 with Glassmorphism variables, CSS Keyframes, Material Symbols
*   **State Management**: React Hooks + Context API
*   **Routing**: React Router DOM

### Backend
*   **Framework**: Spring Boot (Java 17)
*   **Real-time Comms**: Spring WebSockets & STOMP Broker
*   **Database**: PostgreSQL (Neon Serverless)
*   **AI Integration**: Groq Cloud SDK (Llama 3.3)

---

## 🚀 Deployment Architecture

This repository is optimized for modern CI/CD serverless platforms:

*   **Frontend**: Deployed seamlessly on **Vercel** (`/spit-react`). Configured with `vercel.json` for proper React SPA routing.
*   **Backend**: Containerized and deployed on **Render** via Docker. Fully automated using the included `render.yaml` Blueprint.
*   **Database**: Hosted on **Neon Serverless PostgreSQL** for immediate scaling and high availability.

---

## 💻 Local Development

### Prerequisites
*   Node.js 18+
*   Java 17+
*   Maven

### 1. Backend Setup
```bash
cd spit-backend
# Set your local env vars in application.properties or environment
# SPRING_DATASOURCE_URL, XAI_API_KEY
mvn spring-boot:run
```

### 2. Frontend Setup
```bash
cd spit-react
npm install
npm run dev
```

---

## 🔒 Environment Variables Reference

To successfully deploy this application, configure the following secrets on your respective platforms:

### Render (Backend)
*   `SPRING_DATASOURCE_URL`: Your Neon DB connection string.
*   `SPRING_DATASOURCE_USERNAME`: Neon DB User.
*   `SPRING_DATASOURCE_PASSWORD`: Neon DB Password.
*   `XAI_API_KEY`: Groq API Key for the AI assistant.
*   `CORS_ALLOWED_ORIGINS`: Your Vercel frontend URL (e.g., `https://spit.vercel.app`).

### Vercel (Frontend)
*   `VITE_API_URL`: Your Render backend URL (e.g., `https://spit-backend.onrender.com`).

---

*Designed and engineered by Feriel Guesmi.*