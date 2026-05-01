# LLM Response Evaluator

A MERN stack application that simulates real-world RLHF (Reinforcement Learning from Human Feedback) evaluation workflows.

Users submit a prompt, receive two AI responses generated at different temperatures, compare them across multiple quality dimensions, and submit a final verdict.

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 18 + Vite + Tailwind CSS + Recharts |
| Backend    | Node.js + Express.js |
| Database   | MongoDB + Mongoose |
| AI         | Google Gemini API |
| Deployment | Vercel (Frontend) + Render (Backend) |

---

## Project Structure

```bash
llm-evaluator/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── generateController.js
│   │   └── evaluationController.js
│   │
│   ├── routes/
│   │   ├── generateRoutes.js
│   │   └── evaluationRoutes.js
│   │
│   ├── services/
│   │   ├── aiService.js
│   │   └── evaluationService.js
│   │
│   ├── models/
│   │   └── Evaluation.js
│   │
│   ├── middleware/
│   │   └── errorHandler.js
│   │
│   └── server.js
│
└── README.md
```

---

# Features

- Generate **two AI responses simultaneously**
- Response A → Temperature **0.3** (focused output)
- Response B → Temperature **0.9** (creative output)
- Compare across evaluation metrics:
  - Instruction Following
  - Accuracy
  - Helpfulness
  - Quality
  - Naturalness
  - Completeness
- Save evaluations
- View evaluation history
- Analytics dashboard
- Export evaluation data
- Rate limiting implemented

---

# How It Works

User enters prompt:

Example:

```text
Explain SQL vs NoSQL databases
```

Backend sends same prompt to Gemini 1.5 Flash twice:

### Response A
Temperature = 0.3

### Response B
Temperature = 0.9

User evaluates both outputs and submits verdict.

---

# Local Setup

## Prerequisites

Install:

- Node.js (v18+)
- MongoDB Local OR :contentReference[oaicite:4]{index=4} Atlas
- :contentReference[oaicite:5]{index=5} API key

---

## Clone Repository

```bash
git clone https://github.com/yourusername/llm-evaluator.git
cd llm-evaluator
```

---

## Backend Setup

```bash
cd backend
npm install
```

Install Gemini SDK:

```bash
npm install @google/generative-ai
```

Remove Anthropic SDK (if previously installed):

```bash
npm uninstall @anthropic-ai/sdk
```

---

## Frontend Setup

```bash
cd frontend
npm install
```

---

# Environment Variables

## backend/.env

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## frontend/.env

```env
VITE_API_URL=http://localhost:5000
```

---

# Running Locally

### Terminal 1

```bash
cd backend
npm run dev
```

### Terminal 2

```bash
cd frontend
npm run dev
```

Visit:

```bash
http://localhost:5173
```

---

# API Endpoints

## Generate Responses

```bash
POST /api/generate
```

Request:

```json
{
  "prompt": "Explain REST API"
}
```

Response:

```json
{
  "responseA": "...",
  "responseB": "..."
}
```

---

## Save Evaluation

```bash
POST /api/evaluate
```

---

## Get Evaluation History

```bash
GET /api/evaluations
```

---

## Analytics

```bash
GET /api/evaluations/analytics
```

---

## Export Data

```bash
GET /api/evaluations/export
```

---

# Deployment Guide

---

## Backend Deployment → :contentReference[oaicite:6]{index=6}

Push backend to GitHub.

Create new Web Service.

Set:

```bash
Build Command: npm install
Start Command: npm start
```

Environment variables:

```env
MONGODB_URI=your_production_db_url
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

Deploy backend.

---

## Frontend Deployment → :contentReference[oaicite:7]{index=7}

Import frontend repo.

Set environment variable:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com
```

Deploy frontend.

---

# Post Deployment Testing

Test:

```bash
GET /health
```

Expected:

```json
{
  "status": "ok"
}
```

Then test full workflow:

- Generate responses
- Submit evaluation
- View analytics
- Export results

---

# Important Changes from Previous Version

✅ Removed :contentReference[oaicite:8]{index=8} API dependency  
✅ Removed Claude configuration file  
✅ Added :contentReference[oaicite:9]{index=9} Gemini integration  
✅ Updated `.env` variables  
✅ Updated deployment steps  
✅ Reduced API costs using Gemini free tier  

---

# Future Improvements

- Add user authentication
- Add evaluator leaderboard
- Add response ranking model
- Add prompt history
- Add admin dashboard

---

# License

MIT