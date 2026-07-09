# TechGuru Component Reference

## Component Inventory

| Component | Path | Type | Purpose |
|-----------|------|------|---------|
| HeroSection | `src/components/hero/HeroSection.tsx` | Page section | Full-screen video hero with typewriter effect |
| Navbar | `src/components/layout/Navbar.tsx` | Layout | Fixed glass-morphism navigation bar |
| MegaMenu | `src/components/layout/MegaMenu.tsx` | Layout | Dropdown mega menu for desktop nav |
| Footer | `src/components/layout/Footer.tsx` | Layout | 4-column dark footer |
| LoginForm | `src/components/auth/AuthForm.tsx` | Form | Email/password + Google OAuth login |
| RegisterForm | `src/components/auth/RegisterForm.tsx` | Form | New account registration |
| TicketForm | `src/components/tickets/TicketForm.tsx` | Form | Support ticket submission with file upload |
| TicketList | `src/components/tickets/TicketList.tsx` | List | User's ticket list view |
| FAQAccordion | `src/components/ui/FAQAccordion.tsx` | UI | Collapsible FAQ items |
| ErrorBoundary | `src/components/ui/ErrorBoundary.tsx` | UI | React error boundary with recovery UI |
| LanguageSwitcher | `src/components/ui/LanguageSwitcher.tsx` | UI | EN/ZH language toggle |
| Tooltip | `src/components/ui/Tooltip.tsx` | UI | Hover tooltip with auto-positioning |
| HelpText | `src/components/ui/HelpText.tsx` | UI | Inline help text with icon |
| CompareTable | `src/components/compare/CompareTable.tsx` | Data | VMware alternative comparison table |

---

## Layout Components

### Navbar

**File**: `src/components/layout/Navbar.tsx`

Fixed-position glass-morphism navigation. Stays at top with `z-50`.

**Structure**:
```
<nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-black/5">
  └── max-w-7xl container (px-5 sm:px-8 py-4 sm:py-5)
      ├── Logo (Link to /{locale})
      ├── Desktop nav links + MegaMenu
      ├── Desktop right: LanguageSwitcher + Contact link
      └── Mobile hamburger button
  └── Mobile menu overlay (fixed, glass-nav, z-40)
```

**Key behaviors**:
- Logo hover changes to `#00D4FF`
- MegaMenu opens on hover with 150ms debounce
- Mobile menu: CSS transform animation (X icon rotates 45°/−45°)
- Content offset: `<main className="pt-[73px]">`

**Props**: None (self-contained, reads locale from `useLocale()`)

---

### MegaMenu

**File**: `src/components/layout/MegaMenu.tsx`

Desktop-only dropdown menu with hover interaction.

**Props**:
```typescript
interface MegaMenuItem {
  key: string;
  label: string;
  href: string;
  children?: { label: string; href: string; desc?: string }[];
}
```

**Key behaviors**:
- Opens on `mouseEnter`, closes on `mouseLeave` with 150ms delay
- Positioned `absolute top-full left-1/2 -translate-x-1/2 pt-3`
- Panel: white bg, `rounded-2xl shadow-xl p-6`, min-width 320px
- Hover: `bg-[#00D4FF]/5` on items

---

### Footer

**File**: `src/components/layout/Footer.tsx`

Dark footer with 4-column grid.

**Structure**:
```
<footer className="bg-[#18181B] py-12 sm:py-16">
  └── max-w-7xl container
      ├── 4-col grid (Products, Solutions, Company, Support)
      ├── Divider (border-t border-gray-700/50)
      └── Bottom bar: copyright + privacy/terms links
```

**Link hover**: `hover:text-[#00D4FF]`

---

## Form Components

### LoginForm

**File**: `src/components/auth/AuthForm.tsx`

Email/password authentication with Google OAuth option.

**Features**:
- Email + password fields with Lucide icons (Mail, Lock)
- "Forgot password" toggle → shows reset mode
- Google OAuth button with inline SVG logo
- Loading state: `Loader2` spinner animation
- Error/success banners: colored background + border

**Input pattern**:
```
bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3
focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20
```

**Submit button pattern**:
```
w-full bg-[#00D4FF] text-white font-medium py-3 rounded-full
hover:bg-[#00B8DB] hover:shadow-lg transition-all duration-200
disabled:opacity-50
```

**Focus ring**: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2`

---

### RegisterForm

**File**: `src/components/auth/RegisterForm.tsx`

New account creation form. Same visual patterns as LoginForm.

---

### TicketForm

**File**: `src/components/tickets/TicketForm.tsx`

Support ticket submission with auto-save, file upload, and screenshot paste.

**Form fields**:
1. Category (select: build/run/protect)
2. Product/Service (grouped select from Sanity + "Other" option)
3. Occurrence time (datetime-local)
4. Subject (text, max 200 chars)
5. Description (textarea, max 800 chars, with live character counter)
6. Screenshot paste area (paste or click to upload)
7. File attachments (multiple, any format, max 50MB)

**Key patterns**:
- Auto-save to localStorage every 30 seconds via `useAutoSave` hook
- Paste area: dashed border, `hover:border-[#00D4FF]`
- Character counter: green → orange (750) → red (800)
- Success state: green background with `CheckCircle` icon

**Upload flow**: FormData → `/api/upload` → Supabase Storage

---

### ContactPage

**File**: `src/app/[locale]/contact/ContactPage.tsx`

Contact form with client-side validation.

**Fields**: name, email, company, phone, message

**Validation**:
- Name: required
- Email: required + regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Message: required
- Company, phone: optional

---

## UI Components

### FAQAccordion

**File**: `src/components/ui/FAQAccordion.tsx`

Single-open accordion with smooth height animation.

**Props**:
```typescript
interface FAQItem { question: string; answer: string; }
```

**Behavior**:
- Only one item open at a time
- Chevron rotates 180° when open, turns `#00D4FF`
- Answer area: `max-h-0` → `max-h-96` transition
- `aria-expanded` on button, `role="region"` on answer

**Container**: `divide-y divide-gray-200 border border-gray-200 rounded-2xl bg-white shadow-sm`

---

### ErrorBoundary

**File**: `src/components/ui/ErrorBoundary.tsx`

React class component error boundary with fallback UI.

**Fallback UI**:
- Red warning icon in circle
- "Something went wrong" heading
- Two buttons: "Try Again" (primary) + "Back to Home" (secondary)

---

### Tooltip

**File**: `src/components/ui/Tooltip.tsx`

Hover/focus tooltip with auto-positioning (top/bottom).

**Props**:
```typescript
interface TooltipProps {
  content: string;
  children?: React.ReactNode;  // defaults to HelpCircle icon
  side?: 'top' | 'bottom';    // defaults to 'top'
}
```

**Behavior**:
- Auto-flips position if too close to viewport edge
- Uses `aria-describedby` for screen readers
- Dark bg (`bg-gray-900`), white text, arrow indicator

---

### LanguageSwitcher

**File**: `src/components/ui/LanguageSwitcher.tsx`

EN/ZH toggle for i18n.

---

## Page Components

### HeroSection

**File**: `src/components/hero/HeroSection.tsx`

Full-viewport hero with interactive video background.

**Features**:
- Video scrubbing: mouse X position controls video playback position
- Typewriter effect: brand tagline types out character by character
- CTA buttons: fade in 400ms after mount
- Email copy button: clipboard API with fallback to `execCommand`
- Scroll-down indicator: pulse animation + bounce

**Video**: CloudFront-hosted MP4, `muted playsInline preload="auto"`

**Key constants**:
- `SENSITIVITY = 0.5` (mouse-to-video mapping)
- `TYPING_SPEED = 38ms` per character
- `START_DELAY = 600ms` before typing begins

---

### CompareTable

**File**: `src/components/compare/CompareTable.tsx`

VMware alternative comparison table.

**Props**: `{ activeCategory?: 'all' | 'security' | 'networking' | 'cloud' | 'ai' }`

**Features**:
- TechGuru column: `bg-[#00D4FF] text-white`
- Competitor columns: alternating `bg-gray-100` / `bg-gray-50`
- Check/X/Minus icons for feature availability
- Feature description in `text-xs text-gray-500`

---

## Shared Patterns

### Error/Success Banners

```tsx
// Error
<div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
  {error}
</div>

// Success
<div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-600 text-sm">
  {message}
</div>
```

### Loading States

```tsx
<Loader2 size={18} className="animate-spin" />
```

Used in: submit buttons, data loading, file uploads.

### Form Label Pattern

```tsx
<label htmlFor="field-id" className="block text-sm text-gray-700 mb-2">
  Label text *
</label>
```

### Interactive Minimum Touch Target

All interactive elements on mobile: `min-h-[44px]` (WCAG 2.5.8).

### i18n Pattern

All user-facing text uses `next-intl`:
```tsx
const t = useTranslations('namespace');
{t('key')}
```
