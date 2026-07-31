---
name: Scholarly Analytics Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002113'
  on-tertiary-container: '#009668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
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
  sidebar-width: 260px
  gutter: 20px
---

## Brand & Style
The design system embodies the intersection of rigorous academic tradition and cutting-edge computational science. It is built for researchers, administrators, and data scientists who require a workspace that feels both institutional and technologically advanced.

The visual style is **Corporate Modern with a Minimalist focus on Information Density**. It prioritizes clarity over decoration, using generous whitespace not for "breathing room" in the traditional sense, but to separate complex data structures. The UI should evoke a sense of "Quiet Authority"—it is dependable, precise, and objective.

- **Objective:** Facilitate deep focus and rapid data parsing.
- **Tone:** Professional, intelligent, and stable.
- **Visual Direction:** Sharp execution, systematic alignment, and a preference for functional aesthetics over ornamental trends.

## Colors
The palette is rooted in "Oxford" aesthetics, utilizing deep navy tones to establish a foundation of stability.

- **Primary (Deep Navy/Oxford Blue):** Used for structural elements like sidebar navigation, headers, and primary actions. It represents the "Institutional" layer.
- **Accent (Indigo):** Used for interactive elements, focus states, and primary data series. It represents the "Action" layer.
- **Success (Emerald):** Reserved for growth metrics, positive trends, and validated data states.
- **Neutral (Slate):** A sophisticated range of grays used for borders, secondary text, and background layering to prevent pure-black fatigue.
- **Surface:** High-contrast white (#FFFFFF) for the main content "paper" area, with a subtle off-white (#F8FAFC) for the application background.

## Typography
Typography is the primary vehicle for hierarchy in this design system. We use **Inter** for its exceptional legibility in data-heavy environments and its neutral, systematic character.

- **Headlines:** Use tighter letter-spacing and heavier weights to anchor sections.
- **Body Text:** Optimized for long-form reading of research abstracts and data annotations.
- **Labels:** Use uppercase with increased tracking for metadata and table headers to distinguish them from interactive data.
- **Monospace:** **JetBrains Mono** is used exclusively for technical strings, such as DOI numbers, API keys, and raw dataset previews, providing a clear visual distinction from prose.

## Layout & Spacing
The layout uses a **Structured Sidebar Grid**. The navigation is pinned to the left, creating a permanent anchor for the user’s mental model of the application sections.

- **Grid:** A 12-column fluid system is used for the main content area.
- **Density:** This is a high-density system. Vertical spacing between table rows and list items should be compact (8px-12px) to maximize information visibility without scrolling.
- **Safe Areas:** Main content is housed in a "Canvas" area with a minimum 32px margin on all sides.
- **Breakpoints:**
  - **Desktop (1280px+):** Full sidebar expanded.
  - **Tablet (768px - 1279px):** Sidebar collapses to icons; margins reduce to 20px.
  - **Mobile (<768px):** Navigation moves to a top-bar with a drawer; data tables should switch to a card-based list view.

## Elevation & Depth
This design system uses a **Tonal Layering** approach combined with **Low-Contrast Outlines**. We avoid aggressive shadows to maintain a flat, professional "academic paper" feel.

- **Level 0 (Background):** Slate-50 (#F8FAFC) used for the canvas.
- **Level 1 (Cards/Sections):** White (#FFFFFF) with a 1px border in Slate-200. This is the primary surface for data.
- **Level 2 (Dropdowns/Modals):** White (#FFFFFF) with a soft, 8% opacity Indigo-tinted shadow (4px blur, 2px Y-offset) to indicate temporary overlay.
- **Interactive Depth:** Hover states on buttons and cards should not lift (no shadow increase), but rather shift in background color (e.g., Slate-50 to Slate-100).

## Shapes
The shape language is **Soft (0.25rem)**. This provides a subtle modern touch that softens the "coldness" of a data-heavy UI while remaining disciplined and professional.

- **Standard Elements:** Buttons, inputs, and checkboxes use a 4px (0.25rem) radius.
- **Containers:** Large data cards and modals use 8px (0.5rem) to differentiate them from smaller interactive components.
- **Status Pills:** Use a full radius (pill-shaped) to distinguish categorical tags from functional buttons.

## Components
- **Buttons:** Primary buttons are Solid Oxford Blue (#1F293B) with white text. Secondary buttons are outlined in Slate-300. Actions related to "New Dataset" or "Growth" use the Emerald palette.
- **Data Tables:** The core of the system. Use a "Zebra" stripe pattern (Slate-50) on every other row. Headers are Slate-100 with `label-md` typography.
- **Input Fields:** Use a 1px Slate-300 border. On focus, the border shifts to Indigo-500 with a 2px "halo" (shadow) of Indigo at 10% opacity.
- **Chips/Tags:** Used for academic disciplines or status. They should be low-saturation (e.g., light Indigo background with dark Indigo text) to avoid distracting from primary data.
- **Side Navigation:** Vertical links with a 4px left-border active indicator in Indigo-500. Icons should be 20px, stroke-based, and consistently weighted.
- **Metric Cards:** Use large `headline-lg` for the primary figure, with a small sparkline or percentage indicator (Emerald for up, Rose for down) tucked into the bottom right.