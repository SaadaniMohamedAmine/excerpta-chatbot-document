# Excerpta

AI document chat that cites its sources, down to the page.

Excerpta is a full-stack AI chatbot for your documents. Upload a PDF, Word file,
spreadsheet, or code file, ask it questions in plain language, and get answers
grounded in the document — every claim cited to the exact page it came from, with
a click-to-scroll interaction that jumps straight to the source passage.

**Live demo:** [excerpta-chatbot-document.vercel.app](https://excerpta-chatbot-document.vercel.app)

## Features

- Multi-format upload — PDF, DOCX, CSV, and code files, parsed as-is
- Natural-language chat over the uploaded document, streamed token by token
- Page-cited answers — every response names the exact source page
- Click-to-scroll source highlighting — click a citation, jump to the passage
- Multi-document collections — group related documents into one workspace
- PDF and DOCX export of a conversation
- Public sharing — share a read-only link to a conversation, revocable at any time

## Tech stack

**Frontend**
- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v3
- react-pdf
- Phosphor Icons

**Backend**
- Next.js Route Handlers
- Better Auth (Google, GitHub, email/password)
- PostgreSQL (Neon) + Prisma ORM
- Vercel Blob (file storage, client-side direct upload)

**AI**
- Groq (primary chat inference) with automatic fallback to Google Gemini
- Google Gemini (embeddings via `@google/genai`, fallback chat)
- LangChain.js `RecursiveCharacterTextSplitter` for chunking (retrieval and
  streaming themselves are hand-rolled, not routed through the Vercel AI SDK's
  `useChat` — the backend streams plain text with a citation marker parsed
  server-side, which doesn't fit `useChat`'s structured stream protocol)
- Upstash Vector (vector database)

**Infra**
- Vercel (hosting, free tier)
- pdf-parse, mammoth, papaparse, highlight.js (file parsing)
- pdfkit, docx (export)

Every service in this stack runs on its free tier — there are no paid dependencies
anywhere in the deployment.

## Getting started

1. Clone the repository:
   ```bash
   git clone https://github.com/SaadaniMohamedAmine/excerpta-chatbot-document.git
   cd excerpta-chatbot-document
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template and fill in your own keys (Neon connection string,
   Better Auth secret + OAuth client IDs/secrets, Groq API key, Gemini API key,
   Upstash Vector URL/token, Vercel Blob token):
   ```bash
   cp .env.example .env.local
   ```
4. Push the schema to your Neon database (this project uses `prisma db push`,
   not migrations):
   ```bash
   npx prisma db push
   ```
5. Run the dev server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000).

---

Excerpta is part of a portfolio of AI SaaS projects, built to demonstrate
production-grade full-stack AI application patterns end to end — auth, storage,
async processing, retrieval-augmented generation, and deployment — entirely on
free-tier infrastructure.
