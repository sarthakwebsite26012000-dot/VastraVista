# Design Guidelines: Minimalist Black & White - Adidas Aesthetic

## Design Approach

**Minimalist Performance Design** inspired by Adidas - clean, bold, and functional. This is a distraction-free e-commerce experience where performance, simplicity, and typography drive the design.

## Core Design Principles

1. **Minimalist Clarity**: Black, white, and essential elements only
2. **Bold Typography**: Uppercase, strong font weights for impact
3. **Performance First**: Clean layouts with ample whitespace
4. **Functional Elegance**: Every design element serves a purpose

## Typography

**Font Families** (Google Fonts):
- **Headings**: Poppins (modern, bold) or Inter Bold - weights 700, 800
- **Body/UI**: Inter (clean, readable) - weights 400, 500, 600
- **All navigation and CTAs**: UPPERCASE, bold

**Hierarchy**:
- Hero Headlines: text-6xl to text-8xl, uppercase, bold
- Section Titles: text-4xl to text-5xl, uppercase, bold
- Product Names: text-lg, uppercase, semibold
- Body Text: text-base, Inter regular
- Price Tags: text-2xl, bold black
- Labels/Metadata: text-sm, Inter medium

## Color Palette

**Primary**: Black (#000000)
**Secondary**: White (#FFFFFF)
**Accents**: Minimal - gray for secondary text only (#666666, #999999)
**Backgrounds**: Pure white or pure black
**Text**: Pure black on white, pure white on black

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16** (generous whitespace)
- Tight spacing: 2-4 (within components)
- Medium spacing: 8 (between elements)
- Section spacing: 16 (vertical rhythm)

**Grid Structure**:
- Product Grids: 4 columns desktop, 2 columns tablet, 1 column mobile
- Container: max-w-7xl with px-6 padding

## Component Library

### Navigation
- **Header**: Black background with white text
- **Logo**: Bold, left-aligned
- **Categories**: UPPERCASE, centered in header, minimal spacing, bold font
- **Icons**: Right side (search, user, wishlist, cart)

### Homepage Sections

**Hero Section**:
- Full-width black or dark backgrounds
- Bold white UPPERCASE typography
- Simple CTA buttons with arrows "SHOP WOMEN →"
- Minimal overlay text

**Product Cards**:
- White background, no borders
- Clean product image
- Minimal text
- Black uppercase product name
- Bold black price
- Hover effect: subtle underline on name

**Featured Products**:
- 4-column grid
- Simple layout with maximum whitespace

### Product Detail Page

**Layout**: Clean two-column
- Large image gallery on left
- Product info on right with ample spacing
- Bold, uppercase headings
- Clear pricing and CTA

### Footer

**Black background with white text**:
- Organized in columns
- Bold section headings
- Clean links

## Icons & Assets

**Icon Library**: Lucide React - outline style, minimal
- Shopping cart, heart, user, search, filter, star, truck

## Animations & Interactions

**Minimal, purposeful**:
- Product card hover: Subtle underline on name
- Image hover: Slight scale (scale-102 only)
- No parallax or excessive animations

## Mobile Responsiveness

- Hamburger menu for navigation
- Single column layouts
- Touch-optimized buttons and inputs
- Sticky header

This design creates a premium, performance-focused shopping experience inspired by modern athletic luxury brands.