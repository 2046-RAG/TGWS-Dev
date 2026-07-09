# TechGuru Design System

## Design Principles

- **Restrained**: Tinted neutrals + cyan accent, accent color stays ≤10% of surface area
- **Professional**: Enterprise IT — not a startup, not a toy
- **Progressive enhancement**: Content visible without JS; animations are enhancement
- **Accessibility-first**: WCAG 2.1 AA compliance throughout

---

## Color System

### Light Mode

| Role | Token | Value | Tailwind Usage |
|------|-------|-------|----------------|
| Primary | `--color-primary` | `#00D4FF` | `text-[#00D4FF]`, `bg-[#00D4FF]`, `border-[#00D4FF]` |
| Accent | `--color-accent` | `#7B61FF` | Used for product pillars (Run) |
| Surface | `--color-surface` | `#FAFAFA` | Card backgrounds |
| Background | `--color-background` | `#F4F4F5` | Page background |
| Foreground | `--color-foreground` | `#18181B` | Primary text |
| Muted | — | `#6B7280` | Subtitles, secondary text |
| Success | — | `#22C55E` | Product pillar (Protect), form success states |
| Error | — | `#EF4444` | Form validation errors, `bg-red-50`, `text-red-600` |

### Dark Mode (`prefers-color-scheme: dark`)

| Role | Value | Notes |
|------|-------|-------|
| Background | `#09090B` | Replaces `#F4F4F5` |
| Surface | `#18181B` | Replaces `#FAFAFA` |
| Foreground | `#FAFAFA` | Replaces `#18181B` |
| Muted | `#A1A1AA` | Subtitles in dark mode |
| Card border | `rgba(255,255,255,0.08)` | Subtle dark borders |

### Color Usage Rules

- **Primary `#00D4FF`**: CTAs, active states, focus rings, link hovers, product pillar icons
- **Accent `#7B61FF`**: Secondary product pillar (Run), gradients only — not standalone
- **Success `#22C55E`**: Product pillar (Protect), form success messages
- **Never use primary for large backgrounds** — it's an accent, not a surface

---

## Typography

### Font Stack

| Role | Font | Fallback | CSS Variable |
|------|------|----------|-------------|
| Heading | `HelveticaNowDisplay-Medium` | `Helvetica Neue, Arial, sans-serif` | `var(--font-heading)` |
| Body | `HelveticaNowDisplayW01-Rg` | `Inter, sans-serif` | `var(--font-body)` |
| Mono | `JetBrains Mono` | `monospace` | `var(--font-mono)` |

Fonts loaded from `db.onlinewebfonts.com` with `<link rel="preload">` in `layout.tsx`.

### Type Scale

| Element | Class / Value | Weight | Line-height |
|---------|--------------|--------|-------------|
| Section title | `.section-title` — `clamp(2rem, 5vw, 3rem)` | 700 | 1.15 |
| Section subtitle | `.section-subtitle` — `clamp(1rem, 2vw, 1.125rem)` | 400 | 1.7 |
| Card heading | `text-xl font-bold` | 700 | — |
| Body text | Default (`var(--font-body)`) | 400 | 1.6 |
| Nav links | `text-[16px]` | 400 | — |
| Hero tagline | `clamp(18px, 4vw, 26px)` | 400 | 1.3 |
| Hero headline | `clamp(20px, 4.5vw, 30px)` | 800 | 1.35 |
| Button label | `text-[14px]`–`text-[15px]` | 500 | — |

### Typography Rules

- `h1, h2, h3` and `h4, h5, h6` use `text-wrap: balance`
- `p, li, dd, figcaption` use `text-wrap: pretty`
- `-webkit-font-smoothing: antialiased` on body
- Letter-spacing on section titles: `-0.02em`

---

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| Card padding | 24px | `.card` base padding |
| Card hover lift | `-2px` translateY | `.card:hover` |
| Button padding | `12px 24px` | `.btn-primary`, `.btn-secondary` |
| Section vertical | `py-16 sm:py-24` | Page sections |
| Content max-width | `max-w-6xl` / `max-w-7xl` | Container widths |
| Content padding | `px-5 sm:px-8` | Horizontal content padding |
| Grid gap | `gap-6` | Card grids |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| Card | 16px | `.card`, `.glass`, `.glow` |
| Pill buttons | 9999px | `.btn-primary`, `.btn-secondary` |
| Form inputs | `rounded-lg` (~8px) | All form controls |
| Icon containers | `rounded-2xl` (~16px) | Stat icons, feature icons |
| Mega menu | `rounded-2xl` | Dropdown panels |

---

## Component Specifications

### Buttons

#### `.btn-primary`

```css
background: #00D4FF;
color: white;
border-radius: 9999px; /* pill */
padding: 12px 24px;
font-weight: 500;
transition: background-color 0.2s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
```

- **Hover**: `background: #00B8DB`, `transform: scale(1.02)`, `box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3)`
- **Active**: `transform: scale(0.98)`
- **Focus-visible**: `outline: none; box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #00D4FF`
- **Disabled**: `opacity: 50%`, no pointer events

#### `.btn-secondary`

```css
background: transparent;
border: 1px solid rgba(0, 0, 0, 0.15);
color: #18181B;
border-radius: 9999px;
padding: 12px 24px;
```

- **Hover**: `background: rgba(0, 0, 0, 0.04)`, `border-color: rgba(0, 0, 0, 0.25)`, subtle shadow
- **Dark mode**: border `rgba(255,255,255,0.15)`, text `#FAFAFA`

#### Inline submit buttons (TicketForm, LoginForm)

Pattern: `bg-[#00D4FF] text-white font-medium py-3 rounded-full hover:bg-[#00B8DB] hover:shadow-lg transition-all duration-200 disabled:opacity-50`

### Cards

#### `.card`

```css
background: #FAFAFA;
border: 1px solid rgba(0, 0, 0, 0.06);
border-radius: 16px;
padding: 24px;
transition: border-color 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
```

- **Hover**: border `rgba(0, 212, 255, 0.3)`, `translateY(-2px)`, `box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08)`
- **Dark mode**: bg `#18181B`, border `rgba(255,255,255,0.08)`
- **Reduced motion**: no transform on hover

#### `.glass`

```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(0, 0, 0, 0.1);
border-radius: 16px;
```

Used for: navigation overlay (`.glass-nav` uses 85% opacity + blur 16px)

#### `.glow`

```css
background: #F8F9FA;
border: 1px solid rgba(0, 212, 255, 0.2);
border-radius: 16px;
box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
```

- **Hover**: `box-shadow: 0 0 30px rgba(0, 212, 255, 0.2)`, border `rgba(0, 212, 255, 0.4)`

### Forms

All form inputs follow this pattern:

```
bg-gray-50 border border-gray-200 rounded-lg px-4 py-3
text-gray-900 placeholder-gray-400
focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 focus:outline-none
transition-all duration-200
```

- Labels: `text-sm text-gray-700 mb-2`
- Error messages: `bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700`
- Success messages: `bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-600`
- Character counters: `text-xs mt-1 text-right`, color changes at thresholds

### Navigation

- **Fixed top**: `fixed top-0 left-0 right-0 z-50 glass-nav border-b border-black/5`
- **Height**: `py-4 sm:py-5` (approximately 73px total with padding)
- **Logo**: `text-[21px] sm:text-[26px] font-bold tracking-tight` + hover to `#00D4FF`
- **Nav links**: `text-[16px] text-black/80 hover:text-[#00D4FF] transition-colors duration-200`
- **Mega menu**: white bg, `rounded-2xl`, `shadow-xl`, `min-w-[320px] max-w-[480px]`
- **Mobile**: hamburger with CSS animation (rotate-45 translate pattern), full-screen overlay
- **Main content offset**: `pt-[73px]` to account for fixed navbar

### Footer

- Background: `bg-[#18181B]` (dark)
- 4-column responsive grid (`grid-cols-2 md:grid-cols-4`)
- Links: `text-sm text-gray-400 hover:text-[#00D4FF]`
- Section headers: `text-white font-semibold text-sm`
- Bottom bar: `border-t border-gray-700/50`

---

## Animations

### Keyframes

| Name | Description | Duration |
|------|-------------|----------|
| `fadeInUp` | opacity 0→1 + translateY(16px)→0 | 0.6s ease |
| `glow` | box-shadow pulse with cyan | 3s infinite |
| `slideIn` | opacity 0→1 + translateX(-10px)→0 | — |
| `nodeAppear` | opacity 0→1 + scale(0.8)→1 | 0.5s ease |
| `statPop` | opacity 0→1 + translateY(16px) scale(0.9)→0 | 0.5s ease |
| `lineGrow` | clip-path inset(0 100% 0 0)→inset(0) | 1s 0.3s ease-out |
| `blink` | Cursor blink for typewriter | 1s step-end infinite |

### Animation Classes

| Class | Animation | Usage |
|-------|-----------|-------|
| `.anim-fade-up` | fadeInUp 0.6s | Section titles, text blocks |
| `.anim-card` | fadeInUp 0.5s | Card entry, staggered via `animation-delay` |
| `.anim-node` | nodeAppear 0.5s | Network diagram nodes |
| `.anim-line-grow` | lineGrow 1s 0.3s | Timeline connectors |
| `.anim-stat` | statPop 0.5s | Social proof statistics |
| `.scroll-reveal` | IntersectionObserver driven | Progressive content reveal |
| `.reveal` | opacity + translateY | Alternative reveal pattern |

### Scroll Reveal

- Default: content visible (progressive enhancement)
- When JS loads (`.js-loaded`): content starts hidden, `.revealed` class triggers animation
- Threshold: 10% intersection
- Only runs when `prefers-reduced-motion: no-preference`

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .anim-fade-up, .anim-node, .anim-card, .anim-line-grow {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

---

## Accessibility

### Focus Management

- Global focus-visible: `outline: 2px solid #00D4FF; outline-offset: 2px`
- Button focus ring: `box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #00D4FF` (double ring)
- FAQ accordion: `focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-inset`

### Touch Targets

- Mobile: minimum 44px height for all interactive elements (WCAG 2.5.8)
- Nav links: `min-h-[44px]` with `py-4 px-1`
- Form inputs: `min-h-[44px]` (iOS zoom prevention: `font-size: 16px !important`)

### Semantic HTML

- `<nav>` with implicit navigation role
- `<main>` with `pt-[73px]` offset
- `<footer>` for site footer
- `<section aria-label="...">` for page regions
- `<label htmlFor="...">` on all form inputs
- `aria-expanded`, `aria-controls` on accordion buttons
- `aria-describedby` on tooltips
- `aria-label` on icon-only buttons

---

## Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 768px | Single column, 44px touch targets, reduced spacing |
| Tablet | 768px–1024px | 2-column grids, partial mega menu |
| Desktop | > 1024px | Full layout, mega menu, 3-column grids |

### Container Widths

- Main content: `max-w-6xl` (1152px)
- Full-width sections: `max-w-7xl` (1280px)
- Content padding: `px-5 sm:px-8`

---

## Dark Mode Implementation

Dark mode uses `@media (prefers-color-scheme: dark)` — no manual toggle.

Key overrides:
- `body`: bg `#09090B`, color `#FAFAFA`
- `.card`: bg `#18181B`, border `rgba(255,255,255,0.08)`
- `.section-title`: color `#FAFAFA`
- `.section-subtitle`: color `#A1A1AA`
- `.glass-nav`: bg `rgba(9,9,11,0.85)`
- `.btn-secondary`: border `rgba(255,255,255,0.15)`, text `#FAFAFA`
- `.back-to-top`: bg `rgba(24,24,27,0.8)`

---

## Icons

- Library: **Lucide React** (`lucide-react`)
- Standard sizes: 14px (inline), 16px (button), 18px (form), 20px (feature), 24-32px (hero)
- Stroke width: default (2) unless noted (e.g., feature icons use `strokeWidth={1.8}`)
- Color: inherit from parent, or explicit `text-[#00D4FF]` for primary accents
