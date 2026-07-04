# TechGuru Design System

## Theme

- **Mode**: Light (with dark mode support)
- **Strategy**: Restrained — tinted neutrals + cyan accent ≤10%

## Color Palette

| Role | Value | Usage |
|------|-------|-------|
| Primary | `#00D4FF` | CTAs, highlights, links, accents |
| Accent | `#7B61FF` | Secondary accent, gradients |
| Surface | `#FAFAFA` | Card backgrounds |
| Background | `#F4F4F5` | Page background |
| Foreground | `#18181B` | Primary text |
| Muted | `#6B7280` | Secondary text |

Dark mode: bg `#09090B`, surface `#18181B`, text `#FAFAFA`

## Typography

| Role | Font | Fallback |
|------|------|----------|
| Heading | HelveticaNowDisplay-Medium | Helvetica Neue, Arial |
| Body | HelveticaNowDisplayW01-Rg | Inter, sans-serif |
| Mono | JetBrains Mono | monospace |

### Scale

- Section title: `clamp(2rem, 5vw, 3rem)` weight 700, line-height 1.2
- Section subtitle: `clamp(1rem, 2vw, 1.25rem)`, color `#6B7280`, line-height 1.6

## Spacing

- Card padding: 24px
- Card border-radius: 16px
- Button border-radius: 9999px (pill)

## Components

### Card
- Background: `#FAFAFA`, border: `1px solid rgba(0,0,0,0.06)`, radius: 16px
- Hover: border `rgba(0,212,255,0.3)`, translateY(-4px), shadow `0 8px 32px rgba(0,0,0,0.1)`

### Glass
- Background: `rgba(255,255,255,0.7)`, backdrop-filter: blur(20px)
- Used for navigation overlay

### Buttons
- Primary: gradient `linear-gradient(135deg, #00D4FF, #7B61FF)`, white text
- Secondary: transparent, border `1px solid rgba(0,0,0,0.2)`, black text

### Glow
- Border: `1px solid rgba(0,212,255,0.2)`, box-shadow with cyan glow

## Animation

- reveal: fadeUp 0.6s ease
- scroll-reveal: fadeUp 0.6s ease (JS triggered)
- card hover: translateY(-4px) 0.3s
- Reduced motion: all animations disabled via `prefers-reduced-motion`
- Keyframes defined: fadeInUp, glow, slideIn, bounce, pulse-glow, ripple, scrollBounce

## Layout Patterns

- Responsive grid with card-based layouts
- Section-based homepage with hero, services, partners, CTA
- Glass navigation overlay
- Back-to-top button (fixed bottom-right)

## Responsive

- Mobile: 44px min touch targets
- Mobile: reduced section spacing
- Tablet/desktop: full layout
