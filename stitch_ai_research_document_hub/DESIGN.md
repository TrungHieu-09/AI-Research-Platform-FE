---
name: Lumis AI
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0daee'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f7'
  on-surface: '#121c2a'
  on-surface-variant: '#424753'
  inverse-surface: '#273140'
  inverse-on-surface: '#ebf1ff'
  outline: '#727784'
  outline-variant: '#c2c6d6'
  surface-tint: '#085ac0'
  primary: '#004191'
  on-primary: '#ffffff'
  primary-container: '#0058be'
  on-primary-container: '#c4d5ff'
  inverse-primary: '#adc6ff'
  secondary: '#0051d6'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#6e3400'
  on-tertiary: '#ffffff'
  tertiary-container: '#924700'
  on-tertiary-container: '#ffc9a8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#ffdcc7'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311300'
  on-tertiary-fixed-variant: '#723600'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f7'
  error-red: '#ba1a1a'
  ai-gradient-start: '#0058be'
  ai-gradient-end: '#316bf3'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  base: 8px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

Lumis AI embodies a "Technical Elegance" aesthetic, specifically tailored for academic research and high-stakes data synthesis. The brand personality is intellectually rigorous yet approachable—positioning itself as an advanced AI partner rather than a simple tool.

The visual style is a hybrid of **Modern Corporate** and **Glassmorphism**. It utilizes a sophisticated "Blue-Light" palette to signal intelligence and trust. Key characteristics include:
- **Optical Depth:** Use of backdrop blurs (20px for navigation, 12px for sidebars) to maintain context without visual clutter.
- **AI-Infused Details:** Subtle animated gradients and glowing borders (AI-Spark) to denote AI-active areas.
- **Precision Layout:** High information density balanced by generous structural margins and crisp, low-contrast dividers.

## Colors

The color system is built on a "Fidelity" blue foundation, prioritizing legibility and a calm working environment for long-form reading and research.

- **Primary & Secondary:** A range of deep sapphires and vibrant azures are used for active states, CTA buttons, and brand markers.
- **Surface Strategy:** The system avoids pure white in favor of `#f8f9ff` (Surface Bright) to reduce eye strain. Tonal layering is achieved through varying degrees of blue-tinted grays.
- **Functional Accents:** Tertiary ochre is reserved for specific metadata highlights, while a disciplined error red handles destructive actions and notifications.
- **Glass Effects:** Backgrounds for persistent navigation elements use an 80% opacity fill of the surface color combined with a heavy blur.

## Typography

The typography system pairs the technical, geometric precision of **Geist** for structural headings and labels with the utilitarian legibility of **Inter** for dense body content.

- **Headlines:** Use Geist with tight letter spacing for a modern, "dev-tool" feel. Headline-XL is reserved for landing moments or empty states.
- **Body:** Inter is used for all multi-line text, including abstracts and data tables, ensuring readability during extended research sessions.
- **Labels:** Small caps or slightly tracked-out Geist labels help distinguish metadata from primary content.
- **Scale:** A clear hierarchy is maintained between the 32px page titles and the 14px/12px utility text common in sidebars.

## Layout & Spacing

Lumis uses a **Three-Pane Fluid Grid** system. The layout maximizes vertical real estate while maintaining a clear horizontal separation of concerns.

- **Navigation Rail:** A fixed 280px left sidebar for global context.
- **Main Canvas:** A fluid central area that houses the primary data table and header search.
- **Contextual Inspector:** A collapsible 340px right panel for metadata and document details.
- **Margins & Gutters:** A standard 24px gutter is used between major UI sections. On desktop, content is typically inset by 64px from the left/right in full-width views, while mobile collapses this to 16px.
- **Scaling:** On mobile, the Navigation Rail is hidden behind a hamburger menu, and the Metadata Panel is hidden entirely, accessible only via drill-down.

## Elevation & Depth

Visual hierarchy is primarily achieved through **Tonal Layering** and **Glassmorphism** rather than traditional drop shadows.

- **Surface Levels:**
  - `Surface Bright`: The base canvas layer.
  - `Surface`: Standard cards and containers.
  - `Surface Container`: Used for highlighting active rows or secondary backgrounds.
- **Glass Effects:** Persistent headers and sidebars use `backdrop-filter: blur(20px)` to appear as though they are floating above the scrollable content.
- **Ambient Shadows:** Where shadows are used (e.g., cards or modals), they are extremely soft (`0px 10px 40px rgba(31, 41, 55, 0.08)`), providing a subtle sense of lifting without creating hard edges.

## Shapes

The shape language is "Intelligently Rounded"—it balances soft approachability with technical precision.

- **Standard Elements:** Buttons, input fields, and small cards use a consistent 16px radius.
- **Large Containers:** Main content cards and the Metadata Panel container use a generous 32px radius to soften the high-density layout.
- **Navigation:** Active navigation items and tags utilize "Pill" shapes (full rounding) to indicate their interactive and fluid nature.
- **Dividers:** Fine 1px borders (`outline-variant`) provide the structural skeleton without interrupting the visual flow.

## Components

### Buttons
- **Primary CTA:** Uses a linear gradient (Primary to Secondary) with white text and a 16px radius. Includes a leading icon.
- **Ghost/Icon Buttons:** Transparent background with a 50% opacity hover state. Contained within a circular hit area.

### Input Fields
- **Search Bar:** Large (48px height) with a 16px radius, featuring a leading search icon and subtle blue "glow" on focus.
- **Form Selects:** 1px bordered inputs with standard Geist typography for a clean, professional look.

### Data Tables
- **Header:** Sticky, using a `Surface Container Lowest` background and all-caps labels.
- **Rows:** Alternating hover states (`Primary/5%`) and subtle 1px dividers. Title columns use medium weight text for emphasis.

### Chips & Tags
- **Metadata Tags:** Small, semi-rounded rectangles using a subtle `Surface Container High` fill and `on-surface-variant` text.

### Cards & Panels
- **Inspector Panel:** Features a fixed header with title and close actions, followed by a vertically scrollable body with defined sections (Metadata Grid, Abstract, Citation Generator).