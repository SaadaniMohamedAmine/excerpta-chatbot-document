# Excerpta — PROGRESS.md

Statut : 0/N tâches — projet pas encore démarré côté code, en attente du feu vert utilisateur.

## Setup & Fondations
- [ ] Init projet Next.js (dernière version stable) + TypeScript + Tailwind + Shadcn/UI
- [ ] Setup repo git (.gitignore, structure dossiers)
- [ ] Config Prisma + connexion Neon Postgres
- [ ] Premier commit (scaffold vide)
- [ ] **Déploiement Vercel précoce (2e/3e commit)** — obtenir une URL live dès le début
- [ ] Config variables d'environnement (Vercel + local .env)

## Design System — Implémentation (corrigé vs export Stitch)
- [ ] Config Tailwind avec tokens verrouillés (palette Ink & Citation Gold, light+dark)
- [ ] Installation polices (Geist, Source Serif 4, Geist Mono)
- [ ] Installation Phosphor Icons + mapping de remplacement (vs Material Symbols de Stitch)
- [ ] Composants UI de base (boutons, inputs, cards, badges, tags de citation)
- [ ] Theme toggle light/dark
- [ ] Composant logo wordmark "Excerpta" (Source Serif 4, Ink Blue)
- [ ] Layout split-pane réutilisable (document viewer / chat)
- [ ] Sidebar navigation (icônes Phosphor)

## Authentification
- [ ] Setup Better Auth (Google, GitHub, email/password)
- [ ] Page Sign in
- [ ] Page Sign up
- [ ] Middleware de protection des routes

## Base de données & Backend
- [ ] Schema Prisma (User, Document, Conversation, Message, Chunk)
- [ ] Migrations DB
- [ ] Setup Upstash Vector
- [ ] Setup Vercel Blob (stockage fichiers)
- [ ] Setup clients Groq + Gemini (orchestrateur dual-AI)

## Upload & Traitement de documents
- [ ] Upload handler (Vercel Blob)
- [ ] Détection type de fichier + routage (PDF/DOCX/CSV/code)
- [ ] Extraction texte (pdf-parse, mammoth, Papa Parse, highlight.js)
- [ ] Chunking (RecursiveTextSplitter, overlap 200 chars)
- [ ] Génération embeddings (Gemini) + stockage Upstash Vector (metadata page_number, file_id)
- [ ] Traitement asynchrone via Vercel Workflows (gros fichiers)
- [ ] Génération automatique de suggested questions à l'upload

## Chat / RAG
- [ ] Retrieval chain conversationnelle (LangChain.js + Vercel AI SDK hybride)
- [ ] Memory (10 derniers messages)
- [ ] Streaming des réponses
- [ ] Source retrieval (page_number + extrait) par réponse
- [ ] Badge de citation cliquable + interaction auto-scroll vers la source
- [ ] Logique de fallback orchestrateur Groq/Gemini

## PDF Viewer & Workspace
- [ ] Intégration react-pdf (zoom, navigation pages)
- [ ] Overlay highlight des passages cités (canvas, couleur gold)
- [ ] Auto-scroll vers la source au clic sur citation
- [ ] Variante viewer non-PDF (table CSV, code avec coloration syntaxique)
- [ ] Chat UI avec support markdown (react-markdown)
- [ ] Input chat + chips suggested questions

## Dashboard & Gestion documents
- [ ] Dashboard / Mes documents (grille)
- [ ] Empty state upload
- [ ] Collections multi-documents (création, chat unifié)
- [ ] Historique des conversations par document/collection

## Export & Partage
- [ ] Export conversation en PDF
- [ ] Export conversation en DOCX
- [ ] Génération lien de partage public
- [ ] Page de conversation partagée publique (lecture seule)

## Settings
- [ ] Page Settings/compte
- [ ] Préférence de thème
- [ ] Flow suppression de compte

## Landing Page
- [ ] Landing page (hero, features, how it works, CTA)

## SEO, README & Assets
- [ ] README.md complet (screenshots, lien démo, features, stack)
- [ ] Balises Open Graph + image OG dynamique
- [ ] Favicon + meta tags
- [ ] Sitemap.ts / robots.ts

## Qualité & Déploiement final
- [ ] Tests (couverture des flows critiques : upload → chat → citation → export)
- [ ] QA manuelle complète de tous les flows
- [ ] Déploiement final production Vercel
- [ ] Ajout au portfolio (carte + lien)

---
*Mis à jour au fur et à mesure du build, per [[feedback-progress-and-phase-percentage]]. Ne rien cocher sans exécution réelle vérifiée, per [[feedback-verify-before-spec]].*
