# E-Commerce Platform for Indian Ethnic Wear

## Overview

This is a full-stack e-commerce application specializing in traditional Indian ethnic wear (sarees, salwar suits, kurtis, and lehengas). The platform features a visually-rich, culturally-elegant shopping experience with product browsing, filtering, cart management, checkout, and order tracking capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing instead of React Router
- TanStack Query (React Query) for server state management and API data fetching

**UI Component System**
- Radix UI primitives for accessible, unstyled component foundations
- shadcn/ui component library ("new-york" style variant) built on Radix UI
- Tailwind CSS for utility-first styling with custom design tokens
- Custom typography system using Google Fonts: Playfair Display (headings), Inter (body), and Cormorant Garamond (decorative accents)

**Design Approach**
- Premium fashion e-commerce aesthetic inspired by Shopify stores, Myntra, and Ajio
- Visual-first design with large product imagery and zoom capabilities
- Cultural elements through traditional Indian patterns and vibrant color palette
- Responsive grid layouts: 4 columns (desktop), 2 columns (tablet), 1 column (mobile)

**State Management Strategy**
- React Query for server state (products, cart, orders, reviews)
- Local React state (useState) for UI interactions
- localStorage for session persistence (cart session ID)
- Form state managed by react-hook-form with Zod schema validation

**Key Pages & Features**
- Home: Hero carousel, category cards, featured products, testimonials
- Product Listing: Filterable product grids with sorting (category, price, size, color, fabric)
- Product Detail: Multi-image gallery with thumbnails, size/color selection, stock status badge, reviews, add to cart
- Cart: Shopping cart drawer with quantity management and free shipping progress
- Checkout: Multi-step form (shipping, payment, review)
- Order Tracking: Status visualization with delivery timeline
- Admin Dashboard: Product/order management with password protection

**Navigation System**
- Mega dropdown menus in header for Men, Women, Kids categories with subcategories
- Creative Lucide React icons for each category (Shirt for topwear, Dress for womenswear, Baby for kids)
- Responsive mobile navigation with collapsible category menus
- Subcategory structure:
  - **MEN**: Topwear, Bottomwear, Ethnicwear, Footwear, Accessories
  - **WOMEN**: Sarees, Salwar Suits, Kurtis, Lehengas, Topwear, Bottomwear, Dresses, Footwear, Accessories
  - **KIDS**: Boys (Topwear, Bottomwear, Ethnicwear), Girls (Dresses, Ethnicwear, Topwear)

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for RESTful API endpoints
- Separate development and production server configurations
- Custom middleware for request logging and JSON parsing with raw body preservation

**API Design Pattern**
- RESTful endpoints organized by resource (products, cart, reviews, orders)
- Session-based cart management using custom session IDs
- Request validation using Zod schemas from shared types
- Consistent error handling with HTTP status codes

**Key API Endpoints**
- `GET /api/products` - Product listing with filtering/sorting
- `GET /api/products/:id` - Individual product details
- `POST /api/cart` - Add item to cart
- `PATCH /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove cart item
- `POST /api/orders` - Create order from cart
- `POST /api/reviews` - Submit product review

**Data Storage Strategy**
- Storage interface abstraction (IStorage) for implementation flexibility
- In-memory storage (MemStorage class) for development/testing
- Schema designed for PostgreSQL with Drizzle ORM
- UUID-based primary keys generated via `gen_random_uuid()`

### Database Architecture

**ORM & Migration System**
- Drizzle ORM for type-safe database queries and schema management
- Drizzle Kit for schema migrations
- Schema defined in TypeScript with automatic Zod schema generation
- PostgreSQL dialect configuration (via Neon serverless adapter)

**Data Models**
- **Products**: Core catalog with name, description, category, pricing, images array (up to 5 URLs), variants (sizes/colors), fabric, stock status (inStock boolean), featured/new flags, ratings
- **Reviews**: Customer feedback with rating (1-5), comment, timestamps
- **Cart Items**: Session-based cart entries with product reference, quantity, size, color selections
- **Orders**: Customer orders with contact info, shipping address, status tracking, timestamps
- **Order Items**: Line items linking orders to products with quantity and pricing snapshot

**Schema Design Principles**
- Text arrays for multi-value fields (images, sizes, colors)
- Decimal types for precise monetary values
- Boolean flags for product states (inStock, featured, newArrival)
- Timestamp defaults (defaultNow()) for audit trails
- Foreign key relationships through varchar IDs

### External Dependencies

**Database Service**
- Neon Serverless PostgreSQL (@neondatabase/serverless)
- Connection via DATABASE_URL environment variable
- Serverless-optimized connection pooling

**Session Management**
- connect-pg-simple for PostgreSQL session storage (configured but using custom session approach)
- Client-side session ID generation using crypto.randomUUID()
- Session ID passed via x-session-id header for cart/order operations

**Payment Integration**
- Placeholder for payment gateway (not yet implemented)
- Checkout flow designed to accommodate Stripe/Razorpay integration

**Asset Management**
- Static images served from `/attached_assets/generated_images/`
- Product images expected as URLs (could integrate with Cloudinary/S3)
- Vite asset resolution with @assets path alias

**Form Validation**
- Zod for schema validation
- @hookform/resolvers for react-hook-form integration
- drizzle-zod for automatic schema generation from database models

**Development Tools**
- Replit-specific Vite plugins (cartographer, dev-banner, runtime-error-modal)
- TypeScript for type checking across client/server/shared code
- ESBuild for production server bundling

## Recent Updates (Latest Session)

### 1. CRITICAL FIX: Product Search and Category Pages Blank
**Problem**: Clicking on categories (Sarees, Kurtis, etc.) or using search showed blank pages with no products.
**Root Cause**: React Query cache had `staleTime: Infinity`, preventing refetch when category/search parameters changed.
**Solution**: Changed `staleTime: 0` in queryClient.ts to ensure queries always refetch when queryKey changes.
**Files Modified**: `client/src/lib/queryClient.ts`
- Changed staleTime from Infinity to 0
- This enables proper data refetching when navigating between categories or performing searches
**Result**: 
- Category pages now display correct products (Sarees: 9 products, search works with 21+ results)
- Category navigation fully functional for all 7 categories

### 2. Homepage Image Management in Admin Panel
**Implementation**: Added comprehensive image management interface in Admin dashboard
- New "Homepage" tab with two main sections:
  1. **Hero Carousel Slides**: Add/remove hero banner slides with image, title, subtitle, and CTA button
  2. **Category Card Images**: Manage image URLs for all 7 product categories
- Images stored in localStorage via storeSettings interface
- Default Unsplash images provided for all sections
- Admin can add/remove hero slides and update category images with instant preview

**Files Modified**: 
- `client/src/lib/storeSettings.ts` - Extended interface with heroSlides, categoryCardImages, promotionalBanners
- `client/src/pages/Admin.tsx` - Added Homepage Settings tab with image management forms
- `client/src/components/HeroCarousel.tsx` - Updated to load slides from storeSettings instead of hardcoded data

**Storage Structure**:
```typescript
heroSlides?: Array<{
  id: string;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  link: string;
}>;
categoryCardImages?: Record<string, string>;
promotionalBanners?: Array<{ id: string; image: string; title: string }>;
```

### 3. Mega Category Navigation System
**Implementation**:
- Men, Women, Kids main categories with dropdown menus in Header.tsx
- Lucide React icons: Shirt for Men, Dress for Women, Baby for Kids
- Hover effects on desktop with animated chevron icon
- Mobile-friendly accordion navigation

**File Modified**: `client/src/components/Header.tsx`

### 4. Admin Features
- Product management with multiple images (up to 5)
- Stock status toggle
- Order tracking and management
- Homepage image management (new)

## Admin Access
- URL: `/admin`
- Default Password: `sarthak@26012000`
- Customizable via `VITE_ADMIN_PASSWORD` environment variable
- Three tabs: Products, Orders, Homepage