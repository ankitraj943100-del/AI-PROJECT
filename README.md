# AI-Powered PDF Task & Summary Orchestrator

An event-driven, full-stack web application designed for processing PDF documents with artificial intelligence. The platform automatically analyzes uploaded documents to extract:
1. **Executive Summaries:** Highlights, briefs, and key takeaways.
2. **Actionable To-Do Lists:** Categorized action items with priority tags and completion tracking.
3. **Deadlines & Timelines:** Target completion dates and milestone schedules.

---

## 🌟 Key Features & Tech Stack

### Tech Stack
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion (for Glassmorphism & micro-interactions).
- **Backend:** Node.js, Express, TypeScript, Mongoose (MongoDB), JWT Authentication with bcrypt hashing.
- **Event Streaming & Processing:** Apache Kafka (`pdf-upload-event`) with an in-memory queue fallback, Redis pub/sub, and Server-Sent Events (SSE) for real-time progress updates.
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`) for structured JSON schema extraction and real-time document Q&A chat.
- **Infrastructure:** Docker multi-stage containers and Docker Compose setup.

---

## 📁 Repository Structure

```
/Users/ankitraj/Desktop/AI PROJECT /
├── docker-compose.yml
├── .env.example
├── .env
├── README.md
├── backend/                  # Decoupled Express + TypeScript Backend API
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── src/
│       ├── config/           # Database, Redis, Kafka, & Env Config
│       ├── controllers/      # Auth, Document, Task, Team, & AI Controllers
│       ├── middleware/       # JWT Auth, Multer Upload, & Error Handlers
│       ├── models/           # Mongoose Schemas (User, Document, Task, TeamMember, ActivityLog)
│       ├── routes/           # RESTful API Endpoints
│       ├── services/         # AI, PDF Parsing, Event Pipeline, SSE, & S3 Services
│       └── server.ts
└── frontend/                 # Decoupled Next.js 14 App Router Frontend
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── Dockerfile
    └── src/
        ├── app/              # Next.js Pages & Routes
        ├── components/       # Glassmorphism UI, Auth, Dashboard, & Floating AI Assistant
        ├── hooks/            # Custom Hooks
        └── lib/              # API Client & Auth Context
```

---

## 🚀 One-Command Launch (Docker Compose)

To launch the complete multi-container stack (Next.js Frontend, Express Backend, MongoDB, Redis, Kafka, Zookeeper):

```bash
docker-compose up --build
```

Access points:
- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **MongoDB:** `localhost:27017`
- **Redis:** `localhost:6379`
- **Kafka Broker:** `localhost:9092`

---

## 🛠️ Local Development Setup

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=super_secret_jwt_key_pdf_orchestrator_2026

MONGODB_URI=mongodb://127.0.0.1:27017/pdf_orchestrator
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

KAFKA_BROKER=localhost:9092
KAFKA_CLIENT_ID=pdf-processor-client
KAFKA_GROUP_ID=pdf-processor-group

# Obtain your Gemini API Key from Google AI Studio (https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here
```
