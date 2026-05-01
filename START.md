# Quick Start Guide

Get LLM Response Evaluator running locally in under 5 minutes.

---

## Prerequisites

| Tool    | Version  | Check              |
|---------|----------|--------------------|
| Node.js | >= 18    | `node -v`          |
| npm     | >= 8     | `npm -v`           |
| MongoDB | local or Atlas | `mongod --version` |

---

## Step 1 — Choose a FREE AI Provider

Pick **one** option. Groq is the easiest to start with.

### Option A: Groq (Recommended — Free, Fast)

1. Go to [console.groq.com](https://console.groq.com) → Sign up free
2. Click **API Keys** → **Create API Key**
3. Copy the key (starts with `gsk_...`)
4. In `backend/.env`:
   ```env
   AI_PROVIDER=groq
   GROQ_API_KEY=gsk_your_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

### Option B: Google Gemini (Free tier)

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **Create API Key** → copy it
3. In `backend/.env`:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=AIza_your_key_here
   GEMINI_MODEL=gemini-1.5-flash
   ```

### Option C: Ollama (100% Local — No key, No internet)

1. Download from [ollama.com/download](https://ollama.com/download)
2. Open terminal and pull a model:
   ```bash
   ollama pull llama3.2
   ```
3. In `backend/.env`:
   ```env
   AI_PROVIDER=ollama
   OLLAMA_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.2
   ```
4. Make sure Ollama is running: `ollama serve`

### Option D: OpenRouter (Free models available)

1. Go to [openrouter.ai/keys](https://openrouter.ai/keys) → create a free key
2. In `backend/.env`:
   ```env
   AI_PROVIDER=openrouter
   OPENROUTER_API_KEY=sk-or-your_key_here
   OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
   ```

### Option E: Anthropic Claude (Paid — $1/M tokens)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. In `backend/.env`:
   ```env
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-your_key_here
   ANTHROPIC_MODEL=claude-haiku-4-5-20251001
   ```

---

## Step 2 — Set up MongoDB

**Option A — Local:**
```bash
# macOS
brew install mongodb-community && brew services start mongodb-community

# Windows: start mongod from Services
```
URI: `mongodb://localhost:27017/llm-evaluator`

**Option B — Atlas (free cloud):**
1. [cloud.mongodb.com](https://cloud.mongodb.com) → free M0 cluster
2. Create user, whitelist `0.0.0.0/0`, copy connection string

---

## Step 3 — Configure & Install

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env: set AI_PROVIDER + the matching key + MONGODB_URI
npm install

# Frontend
cd ../frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000  (already set)
npm install
```

---

## Step 4 — Run

**Terminal 1 — Backend:**
```bash
cd backend && npm run dev
```
Expected output:
```
✅ MongoDB connected: localhost
🚀 Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Step 5 — Verify

```bash
# Health check
curl http://localhost:5000/health

# Test generation (replace groq with your provider)
curl -X POST http://localhost:5000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is machine learning?"}'
```

---

## Switching Providers Later

Just change `AI_PROVIDER` in `backend/.env` and restart the server:
```env
AI_PROVIDER=groq      # ← change this line only
```
No code changes needed.

---

## Common Issues

| Problem | Fix |
|---------|-----|
| `GROQ_API_KEY is not set` | Add the key to `backend/.env` |
| `Ollama is not running` | Run `ollama serve` in a terminal |
| MongoDB connection refused | Start `mongod` or use Atlas URI |
| CORS error in browser | Check `FRONTEND_URL=http://localhost:5173` in `.env` |
| Port 5000 in use | Change `PORT=5001` in `.env`, update `VITE_API_URL` |
