# Excerpta — Design Audit & Build Recommendations

Audit du design exporté depuis Google Stitch (dossier `excerpta-chatbot-document/stitch_excerpta_ai_document_workspace/`), comparé aux tokens de branding verrouillés le 2026-08-23. Objectif : servir de référence au moment du build Next.js pour ne pas copier le code Stitch tel quel là où il a dérivé.

## ✅ Fidèle au brief — à garder tel quel

- **Typographie** : Geist (UI), Source Serif 4 (wordmark + excerpts de citation), Geist Mono (code/tags de référence) — correctement appliqués sur tous les écrans vérifiés, tailles et graisses cohérentes avec ce qui était demandé.
- **Structure/layout** : split-pane 50/50 (PDF/document à gauche, chat à droite), sidebar icônes fine, citation pills cliquables avec tag `[p. 42]`, top bar sticky, cartes de documents en grille — tout conforme aux 3 LOTs.
- **Logique métier de la couleur accent** : le gold est bien réservé exclusivement aux citations/highlights, jamais utilisé comme couleur d'action primaire — l'intention du design system est respectée, seule la valeur hex est fausse (voir ci-dessous).
- **Prose du `DESIGN.md`** (sections Brand & Style, Layout & Spacing, Elevation & Depth, Shapes, Components) — bien écrite, cohérente avec le brief "Scholarly-Warm", utile à garder comme référence narrative.

## ❌ Dérive détectée — à corriger au moment du build

Même pattern déjà rencontré sur Résona (voir mémoire `project-resona-real-design-system`) : Stitch a injecté son système de tokens **Material Design 3** par défaut au lieu des tokens simples demandés, sur les couleurs et les icônes.

### 1. Couleurs — tokens MD3 au lieu des nôtres

| Rôle | Notre valeur verrouillée | Valeur réelle dans le code Stitch |
|---|---|---|
| Primary (Ink Blue) light | `#1E3A8A` | `#00236F` (notre couleur existe mais reléguée en `primary-container`, un rôle secondaire) |
| Accent citation (Gold) light | `#D4A537` | `#795900` (secondary) / `#FDCA59` (secondary-container) |
| Background light | `#F8FAFC` | `#F7F9FB` (proche mais pas identique) |
| Primary dark | `#6D8FFF` | Pas de valeur explicite — système d'inversion MD3 générique (`inverse-surface`, `primary-fixed-dim` etc.) |
| Accent citation dark | `#E8C468` | Idem — pas de valeur dédiée, dérivé du système MD3 |
| Background/surface dark | `#0B1220` / `#131B2E` | Non présent — utilise `inverse-surface: #2d3133` |

**Action au build :** ignorer entièrement la palette de couleurs générée par Stitch (le bloc `colors` du `DESIGN.md` et du `tailwind.config`). Réimplémenter avec nos vraies valeurs verrouillées (voir tableau "Palette Ink & Citation Gold" dans `project-08-docchat-overview.md`).

### 2. Icônes — Material Symbols au lieu de Phosphor

Toutes les icônes du code réel (`<span class="material-symbols-outlined">...</span>`, police Google Material Symbols Outlined) — alors que **Phosphor Icons** (+ Solar bold-duotone en accents hero) avait été verrouillé.

**Action au build :** remplacer chaque icône Material Symbols par son équivalent Phosphor Icons React (`@phosphor-icons/react`). Table de correspondance à établir écran par écran lors de l'implémentation (ex. `description` → `FileText`, `folder_special` → `FolderStar`, `send` → `PaperPlaneRight`, `zoom_in`/`zoom_out` → `MagnifyingGlassPlus`/`MagnifyingGlassMinus`, `dark_mode` → `Moon`, `auto_awesome` → `Sparkle`, `find_in_page` → `Quotes` ou `BookmarkSimple`, `attach_file` → `Paperclip`, `view_sidebar` → `SidebarSimple`).

## ⚠️ Point annexe — écrans à variante asymétrique

- `workspace_code` n'existe qu'en version **light** (pas de dark).
- `workspace_csv` n'existe qu'en version **dark** (pas de light).

Pas bloquant pour la suite — soit régénérer la variante manquante dans Stitch, soit la construire directement en code au moment du build en s'inspirant de la variante existante + de nos tokens dark/light.

## Verdict global

Le design Stitch est utilisable comme **référence de structure/layout/composants**, pas comme source de vérité pour les couleurs et les icônes. Au build : garder la mise en page, remplacer systématiquement palette + icônes par nos tokens verrouillés.

---
*Généré le 2026-08-23, suite à l'export Stitch (3 LOTs) et audit du design system réel vs branding verrouillé.*
