Answer Assistant (RAG) - Notes

This repository includes a simple mocked RAG (retrieval-augmented generation) assistant used by the forum UI.

Frontend config

- Environment variable: `NEXT_PUBLIC_API_URL`
  - Example: `NEXT_PUBLIC_API_URL=http://localhost:8000`
  - The frontend falls back to `http://localhost:8000` if the variable is not set.
  - Put the value in `.env.local` in the `hemut-frontend` folder for local development.

How to test locally

1. Start backend:

```bash
cd "D:\Brower download files\Hemut_Project\backend"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Start frontend:

```bash
cd "D:\Brower download files\Hemut_Project\hemut-frontend"
npm install
npm run dev
```

3. Open http://localhost:3000/forum and click "Suggest Answer" on a question.

Notes

- The backend endpoint is `POST /suggest` and currently returns mocked suggestions. Replace with a real retriever+generator (e.g., vector DB + LLM) for production-grade suggestions.
- Consider persisting suggestion metadata and auditing accepts/publishes.
