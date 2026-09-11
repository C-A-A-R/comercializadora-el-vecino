---
name: Electric Neo-Boutique
colors:
  surface: '#faf8ff'
  surface-dim: '#d7d9e8'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#ebedfc'
  surface-container-high: '#e5e7f6'
  surface-container-highest: '#dfe2f1'
  on-surface: '#171b26'
  on-surface-variant: '#3b494c'
  inverse-surface: '#2c303b'
  inverse-on-surface: '#eef0ff'
  outline: '#6b7a7d'
  outline-variant: '#bac9cc'
  surface-tint: '#006875'
  primary: '#006875'
  on-primary: '#ffffff'
  primary-container: '#00e5ff'
  on-primary-container: '#00626e'
  inverse-primary: '#00daf3'
  secondary: '#b60059'
  on-secondary: '#ffffff'
  secondary-container: '#e30071'
  on-secondary-container: '#fffbff'
  tertiary: '#006d2f'
  on-tertiary: '#ffffff'
  tertiary-container: '#4bed7c'
  on-tertiary-container: '#00682c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf0ff'
  primary-fixed-dim: '#00daf3'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#ffd9e1'
  secondary-fixed-dim: '#ffb1c4'
  on-secondary-fixed: '#3f001a'
  on-secondary-fixed-variant: '#8f0044'
  tertiary-fixed: '#66ff8e'
  tertiary-fixed-dim: '#3de273'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005322'
  background: '#faf8ff'
  on-background: '#171b26'
  surface-variant: '#dfe2f1'
typography:
  display-hero:
    fontFamily: Outfit
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Outfit
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 22px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-tag:
    fontFamily: Outfit
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  space-4xl: 6rem
  container-max: 80rem
  gutter-desktop: 1.5rem
  gutter-mobile: 1rem
---

## Brand & Style
The design system delivers a high-impact, digital showcase aesthetic engineered specifically for high-ticket home appliances and consumer electronics. The interface balances high-clarity minimalism with electric neon accents, projecting tech authority, immediate accessibility, and premium curation.

### Visual Language & Aesthetic Direction
- **Style Mix:** Clean Minimalist Foundation meets Neo-Digital Accents. A hyper-clean background palette of crisp whites and feather-light slate tones provides a canvas for obsidian-black typography and high-voltage cyan and magenta accents.
- **Tone:** Professional, direct, technologically advanced, and frictionless.
- **Interaction Ethos:** Direct consultation without the friction of conventional checkout funnels. All browsing paths converge cleanly toward instant inquiry and personalized WhatsApp quotation.

## Colors
The palette is structured to maintain maximum readability while delivering neon focal points for product categories, tech specs, and conversion anchors.

### Core Roles
- **Primary (`#00E5FF` / `#0284C7`):** Electric Cyan. Governs technical badges, active category indicators, search emphasis, and high-tech specs highlights.
- **Secondary (`#FF007F` / `#EC4899`):** Electric Magenta. Reserved for curated spotlight tags, new arrivals, premium banners, and secondary interactive states.
- **Tertiary (`#25D366` / `#1EBE5D`):** WhatsApp Emerald. Exclusively reserved for consultation triggers, quote initiators, and real-time support actions.
- **Neutral Core (`#0B0F19` / `#111827`):** Deep Obsidian. Defines high-contrast typography, structural outlines, solid navigation panels, and deep interactive states.
- **Neutral Light (`#FFFFFF`, `#F8FAFC`, `#F1F5F9`):** Pure Canvas and Cloud Mist. Creates seamless breathing room across product grids and specifications tables.

## Typography
The typographic architecture pairs the geometric, confident presence of **Outfit** for structural headers and numerical metrics with the humanist readability of **Plus Jakarta Sans** for interfaces, product descriptions, and technical specifications.

- Use uppercase tracking for `label-tag` tokens (`letter-spacing: 0.08em`) to convey technical precision on category labels and model numbers.
- For product titles within card components, utilize `headline-sm` with strict 2-line clamping to maintain structural alignment.

## Layout & Spacing
The layout implements a rigid 12-column fluid grid system on desktop, collapsing to 8 columns on tablet and 4 columns on mobile.

### Grid Parameters & Breakpoints
- **Mobile (`< 640px`):** 4 columns, 16px lateral padding (`gutter-mobile`), 16px column gaps. Full-width touch cards.
- **Tablet (`640px - 1024px`):** 8 columns, 24px lateral padding, 20px column gaps. 2-up product grids.
- **Desktop (`> 1024px`):** 12 columns, max container width of 1280px (`container-max`), 24px column gaps (`gutter-desktop`). 3-up or 4-up product displays.

### Section Cadence
Maintain vertical rhythm using `space-3xl` (64px) between catalog modules on mobile, scaling to `space-4xl` (96px) on desktop to evoke breathing room around showcase items.

## Elevation & Depth
Depth in this system relies on crisp, ultra-subtle ambient drop shadows paired with controlled neon edge glows on active interactive states.

### Elevation Levels
- **Base Level (Canvas):** Flat `#FFFFFF` or `#F8FAFC` without shadow.
- **Card Rest (`level-1`):** `0px 4px 20px rgba(11, 15, 25, 0.04), 0px 1px 3px rgba(11, 15, 25, 0.02)`. Creates clean separation above light backdrops.
- **Card Hover (`level-2` + Cyan Glow):** `0px 16px 36px rgba(11, 15, 25, 0.08), 0px 0px 24px rgba(0, 229, 255, 0.18)`. Translates the element up by 3px (`translateY(-3px)`).
- **Sticky WhatsApp Quick-Bar / Drawer (`level-3`):** `0px -4px 28px rgba(11, 15, 25, 0.08)`.
- **Active WhatsApp CTA Glow:** `0px 8px 24px rgba(37, 211, 102, 0.35)`.

## Shapes
The system relies on prominent, smooth borders with rounded-2xl geometry across large containers, image viewports, and primary action buttons.

- **Cards & Modals:** Standardized on `rounded-2xl` (16px) for an approachable, tech-grade finish.
- **Buttons & Input Fields:** Standardized on `rounded-xl` (12px) to guarantee tactile stability and clear hit targets.
- **Pills & Status Chips:** Fully pill-shaped (`rounded-full`) to contrast against rectangular product imagery.

## Components

### 1. Product Cards (Catalog Engine)
- **Structure:** Clean white background (`#FFFFFF`), subtle `1px` solid border (`#F1F5F9`), and `rounded-2xl` corners.
- **Top Bar:** Model/SKU tag in `label-tag` font with a faint cyan or magenta background tint (`rgba(0, 229, 255, 0.08)`).
- **Visual Display:** Aspect-ratio 1:1 or 4:3 product frame over neutral gray `#F8FAFC` background.
- **Specifications List:** 3 to 4 pill chips displaying key specs (e.g., "Inverter Eco", "WiFi Ready", "12 Cu. Ft.").
- **Direct CTA:** Full-width WhatsApp button reading **"Cotizar por WhatsApp"**, accompanied by the official WhatsApp icon.
- **Absolute Rule:** No price figures, strike-through pricing, or cart/basket icons anywhere in the component.

### 2. WhatsApp Quote Triggers (Primary CTA)
- **Colorway:** Vibrant WhatsApp green (`#25D366`) with crisp white text (`#FFFFFF`).
- **Typography:** `label-lg` with medium icon sizing (20px).
- **Hover State:** Background lifts to `#1EBE5D` with an ambient glow (`0px 8px 24px rgba(37, 211, 102, 0.35)`).
- **Pre-filled Context:** The CTA must pass pre-configured metadata via URL parameters (Product Name, Reference Code, Category) directly into WhatsApp web/app chat.

### 3. Category & Filter Chips
- **Rest State:** Surface `#F8FAFC`, text `#111827`, border `1px solid #E2E8F0`, `rounded-full`.
- **Selected State:** Solid Obsidian `#0B0F19`, text `#FFFFFF`, subtle bottom border in Neon Cyan `#00E5FF`.
- **Hover State:** Soft border shift to `#00E5FF` with a light cyan wash.

### 4. Search & Filter Bar
- **Input Fields:** Generous 48px height, `rounded-xl`, background `#FFFFFF`, border `1.5px solid #E2E8F0`. Focus state creates a neon-tinted border (`#0284C7`) and ambient ring shadow (`0 0 0 3px rgba(0, 229, 255, 0.2)`).

### 5. Persistent Mobile Quotation Dock
- Fixed bottom drawer on mobile viewports containing the current active filter count and a prominent floating WhatsApp action button labeled **"Cotizar Selección"** or **"Consultar Asesor"**.