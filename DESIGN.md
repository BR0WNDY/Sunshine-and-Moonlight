---
name: Projects Sunshine and Moonlight
description: A magical and intellectual personal portfolio.
colors:
  midnight-void: "#050510"
  ravenclaw-indigo: "#1e1e6e"
  moonlight-white: "#ffffff"
  glass-panel: "rgba(47, 47, 63, 0.6)"
typography:
  display:
    fontFamily: "'Kanit', sans-serif"
    fontWeight: 700
  body:
    fontFamily: "'Kanit', sans-serif"
    fontWeight: 400
rounded:
  md: "15px"
spacing:
  sm: "15px"
  md: "30px"
  lg: "40px"
components:
  nav-panel:
    backgroundColor: "{colors.glass-panel}"
    rounded: "{rounded.md}"
---

# Design System: Projects Sunshine and Moonlight

## 1. Overview

**Creative North Star: "The Starlit Academy"**

The visual system for Projects Sunshine and Moonlight is built around deep, nocturnal gradients and ethereal glassmorphic layers. It reflects the structured intellect of Ravenclaw while capturing the atmospheric magic of a starlit night. The design is modern, clean, and highly legible, refusing to compromise clarity for the sake of its theme. 

This system explicitly rejects generic corporate templates, dry technical displays, and cluttered layouts. It uses its magical atmosphere to frame the content, not overwhelm it. 

**Key Characteristics:**
- Deep, immersive background gradients.
- Floating, translucent "glass" layers for structural components.
- Stark white, modern sans-serif typography that ensures high contrast and clarity.

## 2. Colors

The palette is nocturnal and immersive, prioritizing a magical but professional atmosphere. 

### Primary
- **Midnight Void** (#050510): The foundational anchor. A near-black space that grounds the entire page and provides infinite depth.
- **Ravenclaw Indigo** (#1E1E6E): The energetic core. Used to create the dynamic gradient backdrop and evoke the intellectual energy of the brand.

### Neutral
- **Moonlight White** (#FFFFFF): The primary text color. It cuts through the dark backgrounds to ensure high legibility and precise visual hierarchy.
- **Glass Panel** (rgba(47, 47, 63, 0.6)): The structural separator. Used to create layered depth without fully obscuring the magical backdrop.

**The Glass Depth Rule.** Opaque backgrounds are forbidden for components resting on the main gradient. Structure is built with translucency, not flat colors.

## 3. Typography

**Display Font:** 'Kanit', sans-serif
**Body Font:** 'Kanit', sans-serif

**Character:** Modern, clean, and precise. The exclusive use of Kanit provides a structured, technical feel that balances the magical atmosphere of the color palette. 

### Hierarchy
- **Display** (700): Used for primary hero headlines. 
- **Body** (400): Used for paragraphs, navigation links, and standard interface text. 

**The Legibility Rule.** Text resting directly on the dark gradient must be Moonlight White to maintain stark contrast and complete legibility. 

## 4. Elevation

The system relies heavily on layered depth and glassmorphism rather than traditional flat elevation. 

### Shadow Vocabulary
- **Floating Glass** (`box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5)`): A deep, soft shadow used beneath glass panels to lift them off the gradient backdrop and emphasize their translucency.

**The Floating Architecture Rule.** Structural elements like navigation and primary cards must appear to float above the page, separated by deep shadows and blur filters. 

## 5. Components

### Navigation / Glass Panels
- **Shape:** Softly curved edges (15px radius).
- **Background:** Translucent Glass Panel (`rgba(47, 47, 63, 0.6)`) with a strong backdrop blur (`10px`).
- **Shadow Strategy:** Lifted with the Floating Glass shadow to separate it from the background gradient.
- **Border:** A delicate 1px border (`rgba(255, 255, 255, 0.1)`) to define the edge of the glass. 

## 6. Do's and Don'ts

### Do:
- **Do** use the deep Midnight Void to Ravenclaw Indigo gradient for all foundational backgrounds.
- **Do** rely on glassmorphism and the Floating Glass shadow to create distinct structural elements. 
- **Do** use Moonlight White (#FFFFFF) text on all dark or glass backgrounds for maximum legibility. 

### Don't:
- **Don't** use generic corporate templates or dry, flat design patterns. 
- **Don't** clutter the layout; allow the deep background and glass panels to breathe. 
- **Don't** use opaque, flat colors for structural containers resting on the main gradient.
