# Design Guidelines: Vibrant E-Commerce for Indian Ethnic Wear

## Design Approach

**Reference-Based Approach** drawing from premium fashion e-commerce leaders (Shopify stores, Myntra, Ajio) with cultural sophistication. This is an experience-focused, visually-rich platform where product presentation drives conversion.

## Core Design Principles

1. **Visual Supremacy**: Product imagery is the hero - large, high-quality photos with zoom capabilities
2. **Cultural Elegance**: Incorporate subtle traditional Indian patterns/motifs in borders, dividers, and decorative elements
3. **Vibrant Energy**: Bold, confident layouts with dynamic product grids and engaging visual hierarchy
4. **Trust & Transparency**: Prominent review displays, size guides, and clear pricing

## Typography

**Font Families** (Google Fonts):
- **Headings**: Playfair Display (elegant, fashion-forward) - weights 600, 700
- **Body/UI**: Inter (clean, readable) - weights 400, 500, 600
- **Accents**: Cormorant Garamond for decorative section titles - weight 500 italic

**Hierarchy**:
- Hero Headlines: text-5xl to text-6xl, Playfair Display
- Section Titles: text-3xl to text-4xl, Playfair Display
- Product Names: text-xl, Inter semibold
- Body Text: text-base, Inter regular
- Price Tags: text-2xl, Inter bold (prominent display)
- Labels/Metadata: text-sm, Inter medium

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** (e.g., p-4, gap-8, my-12)
- Tight spacing: 2-4 (within components)
- Medium spacing: 6-8 (between elements)
- Section spacing: 12-16 (vertical rhythm)

**Grid Structure**:
- Product Grids: 4 columns desktop (grid-cols-4), 2 columns tablet (md:grid-cols-2), 1 column mobile
- Container: max-w-7xl with px-6 padding
- Content areas: max-w-6xl for product listings

## Component Library

### Navigation
- **Sticky Header**: Logo left, category navigation center, search/cart/account icons right
- **Category Mega Menu**: Dropdown with images and subcategories on hover
- Search bar with autocomplete suggestions
- Cart icon with item count badge

### Homepage Sections

**Hero Carousel** (full-width, h-[600px]):
- Large lifestyle images showcasing collections
- Overlay text with CTA buttons (blurred background for buttons)
- Auto-rotating 5-second intervals with manual controls
- **Images**: 3-4 hero slides showing models in elegant sarees/ethnic wear in vibrant settings

**Category Cards** (4-column grid):
- Large square images with category name overlay
- Hover effect: slight zoom on image
- **Images**: Category-specific product photos (Sarees, Salwar Suits, Kurtis, Lehengas)

**Featured Products** (4-column masonry grid):
- Product card: Image, title, price, quick-view button, wishlist icon
- Sale badge, "New Arrival" tag positioning
- **Images**: High-quality product photos on clean backgrounds

**Offer Banners** (2-column split):
- Bold promotional graphics with discount percentages
- Time-limited offer countdown timers
- **Images**: Festive/seasonal promotional banners

**Testimonials** (3-column cards):
- Customer photo, star rating, review text, name
- Rotating carousel format

### Product Listing Page

**Filter Sidebar** (sticky, w-64):
- Collapsible sections: Category, Price Range (slider), Size, Color (color swatches), Fabric Type
- Active filter chips with clear-all option
- Sort dropdown: Price, Popularity, New Arrivals

**Product Grid**: Same 4-column pattern with pagination or infinite scroll

### Product Detail Page

**Two-column layout** (60/40 split):

**Left Column - Image Gallery**:
- Main image display (large, zoomable on hover)
- Thumbnail strip below (4-5 thumbnails)
- **Images**: Multiple angles, close-ups of fabric/embroidery, model shots

**Right Column - Product Info**:
- Breadcrumb navigation
- Product title (large, Playfair Display)
- Star rating + review count (clickable)
- Price display: Original price (strikethrough if discounted), sale price (prominent)
- Color variants: Visual swatches with borders
- Size selector: Button group with size guide link
- Size Guide Modal: Measurement chart with helpful tips
- Quantity selector: +/- buttons
- Add to Cart CTA (large, prominent)
- Wishlist heart icon
- Product description tabs: Details, Size & Fit, Care Instructions, Delivery Info
- Customer Reviews section below: Star breakdown, written reviews with photos, pagination

### Shopping Cart

**Slide-out drawer** (right side, w-96):
- Cart items list: Thumbnail, name, size/color, quantity adjuster, price, remove icon
- Subtotal calculation
- Continue Shopping / Proceed to Checkout buttons
- Free shipping threshold indicator

**Full Cart Page**:
- Table layout: Product | Price | Quantity | Total
- Order summary sidebar: Subtotal, Shipping, Discount code input, Total
- Continue Shopping / Checkout CTAs

### Checkout Flow

**Multi-step progress indicator**: Shipping → Payment → Review
**Form sections**: Clean, generous spacing between fields
**Payment Integration**: Stripe Elements embedded seamlessly
**Order Summary**: Sticky sidebar with cart contents

### Order Tracking Page

**Timeline visualization**: Order Placed → Confirmed → Shipped → Out for Delivery → Delivered
- Status icons with connecting lines
- Estimated delivery date prominent
- Tracking number and courier details

## Icons & Assets

**Icon Library**: Heroicons (via CDN) - outline style for UI, solid for emphasis
- Shopping cart, heart (wishlist), user profile, search, filter, star (ratings), truck (delivery)

## Animations & Interactions

**Minimal, purposeful animations**:
- Product card hover: Subtle image zoom (scale-105 transition)
- Add to cart: Brief success checkmark animation
- Filter application: Smooth fade transitions on product grid
- NO excessive scroll animations or parallax effects

## Images Strategy

**Hero Section**: YES - Large rotating carousel with vibrant lifestyle photography
**Product Photos**: Essential - Multiple high-quality images per product
**Category Headers**: Medium-size banner images for each category page
**Promotional Banners**: Seasonal/festival campaign graphics
**Customer Reviews**: User-uploaded product photos alongside reviews

## Mobile Responsiveness

- Single column layouts on mobile
- Hamburger menu for navigation
- Sticky filter button (opens as bottom sheet)
- Swipeable image galleries
- Touch-optimized size/color selectors (larger tap targets)

## Trust Elements

- Security badges in footer and checkout
- Customer review count prominently displayed
- Return policy and shipping info easily accessible
- Live chat support bubble (bottom right)

This design creates a premium, culturally-resonant shopping experience that balances vibrant visual appeal with e-commerce functionality and user trust.
