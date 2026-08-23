---
name: Excerpta
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#444651'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#795900'
  on-secondary: '#ffffff'
  secondary-container: '#fdca59'
  on-secondary-container: '#735500'
  tertiary: '#4b1c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#6e2c00'
  on-tertiary-container: '#f39461'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#ffdf9f'
  secondary-fixed-dim: '#f1bf4f'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#773205'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-wordmark:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  h1:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  h1-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  h2:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-ui:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-excerpt:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  label-mono:
    fontFamily: Geist Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  caption:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  workspace_gap: 1px
---

## Brand & Style
The design system for this product is rooted in the "Scholarly-Warm" aesthetic—a fusion of modern technical precision and the timeless authority of academic publishing. It targets researchers, legal professionals, and academics who require a focused environment for deep synthesis.

The visual language follows a **Modern-Corporate** style with **Minimalist** tendencies. It avoids unnecessary decoration, favoring structural clarity and high-quality typography to establish trust. The "warmth" is achieved through the intentional use of serif document text and a gold accent palette that mimics physical highlighters and gilded edges of classic volumes. The emotional response should be one of quiet confidence, reliability, and intellectual rigor.

## Colors
The palette is divided into functional roles to maintain a clear information hierarchy. 

- **Ink Blue (Primary):** Used for primary actions, navigation states, and the wordmark. It represents the "ink" of the scholar.
- **Citation Gold (Accent):** Reserved strictly for semantic highlighting. Use this for citation tags, text highlights within document excerpts, and source-link indicators. Never use this for primary action buttons.
- **Neutrals:** The background and surface colors provide a high-contrast environment. In light mode, the #F8FAFC background provides a soft, paper-like feel compared to pure white #FFFFFF surfaces.

## Typography
This design system employs a dual-typeface strategy to distinguish between the "Interface" and the "Information."

1. **The Interface (Geist Sans):** Used for all navigation, buttons, labels, and system messages. It is modern, precise, and unobtrusive.
2. **The Document (Source Serif 4):** Used for the brand wordmark and all document-sourced text. This transition to serif signals to the user they are reading "source material" rather than AI-generated UI.
3. **The Metadata (Geist Mono):** Used for technical references, page numbers (e.g., `[p. 42]`), and code snippets.

All headings use Geist to maintain a clean, organized structure. Document excerpts should have generous line height (1.6x) to facilitate long-form reading.

## Layout & Spacing
The layout follows a **Fixed-Pane** philosophy, specifically designed for side-by-side analysis.

- **Split-Pane Workspace:** The primary interface is a horizontal split. The left pane contains the AI Chat (UI-heavy), and the right pane contains the Document Viewer (Content-heavy). 
- **The 1px Rule:** Use 1px borders (#E2E8F0 / #1E293B) instead of wide gutters to separate panes, maximizing screen real estate for text.
- **Document Grid:** When browsing libraries, use a fixed grid of cards with 24px margins. Cards should align to a 12-column system on desktop, reflowing to 1 column on mobile.
- **Sticky Navigation:** A top bar (64px height) remains fixed, providing constant access to the wordmark, search, and theme toggle.

## Elevation & Depth
Elevation is communicated through **Tonal Layers** rather than heavy shadows.

- **Level 0 (Background):** The lowest layer, using the neutral background color.
- **Level 1 (Panes/Cards):** Raised surfaces use the pure white (light) or #131B2E (dark) surface color. These should have a subtle 1px border.
- **Level 2 (Dropdowns/Popovers):** Only use shadows for floating elements that temporarily overlay the split-pane workspace. Use a soft, 12% opacity neutral shadow with a 16px blur.
- **Interactivity:** Elements do not "lift" on hover; instead, they change border color to Primary Ink Blue or background color to a subtle 5% tint of the primary color.

## Shapes
The shape language is disciplined and "Soft" (0.25rem). 

- **Standard Elements:** Buttons, input fields, and tags use a 4px radius (`rounded-sm`). This maintains a professional, slightly architectural feel.
- **Containers:** Large document cards and workspace panes use an 8px radius (`rounded-lg`) to soften the overall interface without appearing "bubbly."
- **Icons:** Use Phosphor Icons in "Regular" weight for UI actions. For hero-state illustrations, use "Bold-Duotone" to introduce the Primary and Accent colors into the iconography.

## Components
- **Buttons:** Primary buttons are solid Ink Blue with white text. Secondary buttons use a 1px border of the primary color. No rounded-pill shapes; stick to the 4px radius.
- **Citation Tags:** Small, inline Geist Mono tags. Background: 10% opacity Citation Gold. Border: 1px Citation Gold. Text: Primary Text color.
- **Document Cards:** Vertical orientation. Top half contains a thumbnail or file-type icon (Bold-Duotone). Bottom half contains the title (Geist H2) and "Last Viewed" metadata (Geist Caption).
- **Theme Toggle:** A minimalist switch in the sticky nav. Use the Sun/Moon Phosphor icons. Transition should be instantaneous with no bounce animation to maintain the "Precise" tone.
- **Input Fields:** Search and chat inputs use a subtle background tint and a 1px border that becomes Primary Ink Blue on focus. Use Geist UI font for input text.
- **Excerpts:** Blocks of text styled in Source Serif 4. Any highlighted text within an excerpt uses a Citation Gold background with 30% opacity, mimicking a physical highlighter.