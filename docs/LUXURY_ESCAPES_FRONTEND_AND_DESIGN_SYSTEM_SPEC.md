# Luxury Escapes Frontend & Design System – Technical Spec

**Purpose:** To our best understanding (from public site inspection and job description), this doc describes Luxury Escapes’ frontend stack and design system (**LuxKit**). Use it to align a repo: remove shadcn, adopt styled-components + tokens, keep Storybook.

**Last inferred:** From live site (luxuryescapes.com) and [Frontend Engineer - Design System job](https://www.linkedin.com/jobs/view/4352592446/).

---

## 1. Design system name

- **LuxKit** – in-house design system. All references in code/docs should use this name where appropriate.

---

## 2. Tech stack (design system & frontend)

| Area | Technology | Notes |
|------|------------|--------|
| **Styling** | **styled-components** (v6-style; `data-styled="true"`, `data-styled-version` in DOM) | CSS-in-JS. No Tailwind, no utility-first. |
| **Tokens** | **CSS custom properties** (variables) | Single source of truth for colour, typography, radius, spacing, layout. |
| **Components** | **React** + **TypeScript** | All UI components are React; TypeScript for props and APIs. |
| **Icons** | SVG-based, size via `--svg-icon-size` | No assumption of a specific icon library; size driven by tokens. |
| **Fonts** | Custom: **"Suisse Int'l"** with fallbacks | e.g. `"Suisse Int'l", "Helvetica Neue", Helvetica, Arial, sans-serif`. Loaded via font CSS (e.g. `/fonts/LE-fonts.css`). |
| **Not used** | Tailwind CSS, shadcn/ui, Radix UI, Material UI, Chakra | Design system is fully in-house. **Shadcn (and Radix) must be removed** from any repo aligning with this spec. |

**Action for repo:**

- Remove **shadcn** and any **Radix** dependencies.
- Remove **Tailwind** if present (or confine to non–design-system usage only; design system components should not rely on Tailwind).
- Add / use **styled-components** for all design system components.
- Use **CSS custom properties** for all design decisions (colours, type, spacing, radius); no hardcoded hex/px in components where a token exists.

---

## 3. Design tokens (CSS custom properties)

Tokens are the only source of truth for visual design. Components reference tokens, not raw values.

### 3.1 Colour

- **Pattern:** `--palette-{role}-{variant}-{usage}`.
- **Examples (from site):**
  - `--palette-neutral-default-five`
  - `--palette-neutral-default-six`
  - `--palette-highlight-secondary-normal-background`
  - `--palette-highlight-secondary-light-foreground`
- **Component-level overrides** (e.g. loading states): `--loading-box-bg-color`, `--loading-box-wave-color` (set per variant from palette tokens).

**Action:** Define a `:root` (or theme) token set for colours; have components use only these variables. Replace any shadcn/Tailwind colour classes with token references.

### 3.2 Typography

- **Global:** `--text-line-height`, `--text-icon-size`, `--line-clamp`, `--line-clamp-tablet`, `--line-clamp-desktop`.
- **Font stack:** `"Suisse Int'l", "Helvetica Neue", Helvetica, Arial, sans-serif`.
- **Scale (representative):**
  - Large: 16px, line-height 24px, icon 1.25rem.
  - Medium: 14px, line-height 20px, icon 1.25rem.
  - Small: 12px, line-height 16px, icon 1rem.
- **Weights:** 400 (normal), 600 (bold).

**Action:** Create typography tokens and use them in Text/Typography/BodyText components; no hardcoded font sizes or line-heights in design system components.

### 3.3 Border radius

- **Tokens:** `--border-radius-xs`, `--border-radius-s`, `--border-radius-m`, `--border-radius-l`, `--border-radius-round`.
- **Usage:** Buttons, cards, inputs, loading boxes. Components get a variant/prop that maps to one of these.

**Action:** Replace fixed `rounded-*` (Tailwind) or ad-hoc radius with these tokens.

### 3.4 Spacing & layout

- **App-level (optional):** `--app-header-floating-offset`, `--app-header-relative-offset`, `--app-footer-floating-offset`, `--app-footer-relative-offset`.
- **Component spacing:** Prefer tokens (e.g. `--spacing-xs/s/m/l`) over magic numbers; if none exist in the spec, introduce a small set and use consistently.

**Action:** Avoid hardcoded padding/margin in design system components; use spacing tokens or a single spacing scale.

### 3.5 Icons

- **Token:** `--svg-icon-size` (default e.g. 1.5rem; in text context can use `--text-icon-size`).

**Action:** All icon components should size via this token (or a variant that sets it).

---

## 4. Component architecture

### 4.1 Primitives (building blocks)

These are the core of the system; higher-level components compose them.

| Component | Responsibility | Variants / props (representative) |
|-----------|----------------|-----------------------------------|
| **Typography** | Headings / emphasised text | variant (large/medium/small), weight, align, wrap (no-wrap, truncate, line-clamp), format (lowercase, titlecase, uppercase) |
| **BodyText** | Body copy | Same scale; supports semantic tags (e.g. small, b, i, s), underline, strike-through |
| **SvgIcon** | Icons | Size from `--svg-icon-size`; flex-shrink: 0 |
| **LoadingBox** | Skeleton / loading | colour (e.g. neutral, highlight-secondary), border-radius (XS–round), floating vs inline |
| **BaseClickable** | Base for buttons/cards | Alignment (e.g. stretch), relative positioning |
| **ClickableLink** | Link base | Block/relative; for text/icon links |
| **TooltipTrigger** | Wrapper for tooltips | Cursor pointer when not disabled |

**Pattern:** One responsibility per primitive; variants via props that map to tokens and modifier classes in styled-components. No Radix/shadcn primitives; implement or wrap only what’s needed, with tokens.

**Action:** Replace shadcn components with these (or equivalent) primitives implemented in styled-components and tokens. Remove `@radix-ui/*` and shadcn-specific exports.

### 4.2 Composed components

- Built from primitives + layout + tokens only.
- Do not introduce new one-off colours or spacing; use the token set.

**Action:** Ensure any “molecules” or “organisms” use only primitives and tokens (no new Tailwind/shadcn classes).

---

## 5. Styling conventions (styled-components)

- **No utility classes in markup:** No Tailwind-style classes in design system component JSX; all styling in styled-components.
- **Variant props:** Components receive props (e.g. `variant="large"`, `colour="neutral"`, `borderRadius="M"`) and the styled-component maps them to token-based CSS.
- **Class naming:** Styled-components generate hashed class names (e.g. `ComponentName__StyledElementName-sc-xxxxx-0`). No need to replicate that exact format; just keep names consistent and scoped.
- **Responsive:** Use media queries inside styled-components (e.g. 576px, 992px) or token overrides (e.g. `--line-clamp-tablet`) rather than Tailwind breakpoint classes.

**Action:** Migrate all design system UI from Tailwind/shadcn to styled-components + token-driven variants. Remove `className`-based utility styling from design system components.

---

## 6. Naming conventions

- **Tokens:** `--{category}-{role}-{variant}-{usage}` (e.g. `--palette-highlight-secondary-normal-background`).
- **Components:** PascalCase, semantic (Typography, BodyText, LoadingBox, Button, etc.).
- **Variants:** kebab-case or single letter in props (e.g. `variant="large"`, `borderRadius="M"`); BEM-like modifiers in styled-components (e.g. `.colour-neutral`, `.border-radius-M`) are acceptable.

**Action:** Align new and updated components with these conventions; rename any shadcn-style props to match (e.g. avoid `classNames` / `className` overrides for variant styling; use props instead).

---

## 7. Responsive behaviour

- **Breakpoints (representative):** 576px (tablet), 992px (desktop).
- **Where:** In styled-components (media queries) and/or token overrides (e.g. `--line-clamp-tablet`, `--line-clamp-desktop`).
- **Alignment:** Typography can have responsive alignment (e.g. `align-on-tablet-*`, `align-on-desktop-*`).

**Action:** Replace Tailwind responsive prefixes with media queries or token-based responsive behaviour in styled-components.

---

## 8. Storybook

- **Keep Storybook.** Luxury Escapes’ job description emphasises documentation and adoption; Storybook is a standard way to document design system components.
- **Use it for:** All LuxKit primitives and composed components; document props, tokens, and variants. Optionally document design tokens in a dedicated page or addon.
- **Remove:** Any shadcn-specific stories or Radix-based examples; replace with styled-components + token-based implementations.

**Action:** Retain Storybook; update all stories to use the new component API (styled-components + tokens). Add token docs if helpful.

---

## 9. What to remove from the repo (checklist)

- [ ] **shadcn/ui** – all shadcn components and configuration.
- [ ] **Radix UI** – `@radix-ui/*` packages used only for shadcn; remove or replace with custom implementations using tokens.
- [ ] **Tailwind** (for design system) – remove Tailwind from design system components; use styled-components + tokens only. (Tailwind can remain for app/layout if the rest of the app uses it, but the design system layer should not depend on it.)
- [ ] **Utility-class-driven styling** in design system components – replace with styled-components and token references.
- [ ] **Hardcoded colours/fonts/spacing** in components – replace with CSS custom properties from this spec.

---

## 10. What to add or align

- [ ] **styled-components** – add if missing; use for every design system component.
- [ ] **CSS custom properties** – define tokens (colour, typography, radius, spacing, icon size) in a theme/global file and use in all components.
- [ ] **Primitive set** – Typography/BodyText, SvgIcon, LoadingBox, BaseClickable/ClickableLink, Button, Tooltip (or TooltipTrigger) implemented with tokens and variants.
- [ ] **Token documentation** – in Storybook or a separate doc, list tokens and usage so design and dev stay aligned.
- [ ] **LuxKit naming** – where relevant (e.g. docs, Storybook title), refer to the system as LuxKit and align component names with the table in §4.1.

---

## 11. Summary one-liner

**Luxury Escapes’ frontend / design system (LuxKit) is built with React, TypeScript, styled-components, and CSS custom properties (tokens). It does not use Tailwind, shadcn, or Radix. Components are token-driven primitives and compositions; Storybook is kept for documentation. To align a repo: remove shadcn and Radix; remove or isolate Tailwind from the design system; implement design system UI in styled-components using the token set above.**

---

*This spec is based on public information and inference; internal implementation may differ. Use as a migration target, not an official contract.*
