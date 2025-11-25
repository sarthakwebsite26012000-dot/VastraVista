import {
  type Product,
  type InsertProduct,
  type Review,
  type InsertReview,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type CartItemWithProduct,
  type OrderWithItems,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Products
  getProducts(filters?: {
    category?: string;
    priceRange?: [number, number];
    sizes?: string[];
    colors?: string[];
    fabrics?: string[];
    sortBy?: string;
  }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Reviews
  getReviewsByProduct(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Cart
  getCartItems(sessionId: string): Promise<CartItem[]>;
  getCartItemsWithProducts(sessionId: string): Promise<CartItemWithProduct[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<void>;

  // Orders
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private reviews: Map<string, Review>;
  private cartItems: Map<string, CartItem>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;

  constructor() {
    this.products = new Map();
    this.reviews = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.seedProducts();
  }

  // Products
  async getProducts(filters?: {
    category?: string;
    priceRange?: [number, number];
    sizes?: string[];
    colors?: string[];
    fabrics?: string[];
    sortBy?: string;
    search?: string;
  }): Promise<Product[]> {
    let products = Array.from(this.products.values());

    // Apply filters
    if (filters?.category) {
      const categoryMap: Record<string, string> = {
        sarees: "Sarees",
        "salwar-suits": "Salwar Suits",
        kurtis: "Kurtis",
        lehengas: "Lehengas",
        "mens-wear": "Mens Wear",
        "kids-wear": "Kids Wear",
        "bags": "Bags",
      };
      const categoryName = categoryMap[filters.category] || filters.category;
      products = products.filter((p) => p.category === categoryName);
    }

    // Search by name, category, or fabric
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter((p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower) ||
        p.fabric.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.priceRange) {
      const [min, max] = filters.priceRange;
      products = products.filter((p) => {
        const price = parseFloat(p.price);
        return price >= min && price <= max;
      });
    }

    if (filters?.sizes && filters.sizes.length > 0) {
      products = products.filter((p) =>
        filters.sizes!.some((size) => p.sizes.includes(size)),
      );
    }

    if (filters?.colors && filters.colors.length > 0) {
      products = products.filter((p) =>
        filters.colors!.some((color) => p.colors.includes(color)),
      );
    }

    if (filters?.fabrics && filters.fabrics.length > 0) {
      products = products.filter((p) => filters.fabrics!.includes(p.fabric));
    }

    // Apply sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case "price-low":
          products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case "price-high":
          products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case "rating":
          products.sort(
            (a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"),
          );
          break;
        case "newest":
          products.reverse();
          break;
        default:
          // featured - keep default order
          break;
      }
    }

    return products;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter((p) => p.featured);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      rating: "0",
      reviewCount: 0,
    };
    this.products.set(id, product);
    return product;
  }

  // Reviews
  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter((r) => r.productId === productId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);

    // Update product rating
    const product = this.products.get(insertReview.productId);
    if (product) {
      const reviews = await this.getReviewsByProduct(insertReview.productId);
      const avgRating =
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      product.rating = avgRating.toFixed(1);
      product.reviewCount = reviews.length;
      this.products.set(product.id, product);
    }

    return review;
  }

  // Cart
  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.sessionId === sessionId,
    );
  }

  async getCartItemsWithProducts(
    sessionId: string,
  ): Promise<CartItemWithProduct[]> {
    const items = await this.getCartItems(sessionId);
    return Promise.all(
      items.map(async (item) => {
        const product = await this.getProduct(item.productId);
        return { ...item, product: product! };
      }),
    );
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existing = Array.from(this.cartItems.values()).find(
      (item) =>
        item.sessionId === insertItem.sessionId &&
        item.productId === insertItem.productId &&
        item.size === insertItem.size &&
        item.color === insertItem.color,
    );

    if (existing) {
      // Update quantity
      existing.quantity += insertItem.quantity;
      this.cartItems.set(existing.id, existing);
      return existing;
    }

    const id = randomUUID();
    const item: CartItem = { ...insertItem, id };
    this.cartItems.set(id, item);
    return item;
  }

  async updateCartItem(
    id: string,
    quantity: number,
  ): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;

    item.quantity = quantity;
    this.cartItems.set(id, item);
    return item;
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<void> {
    const items = await this.getCartItems(sessionId);
    items.forEach((item) => this.cartItems.delete(item.id));
  }

  // Orders
  async createOrder(
    insertOrder: InsertOrder,
    items: InsertOrderItem[],
  ): Promise<Order> {
    const orderId = randomUUID();
    const order: Order = {
      ...insertOrder,
      id: orderId,
      createdAt: new Date(),
      trackingNumber: `TRK${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };
    this.orders.set(orderId, order);

    // Create order items
    for (const insertItem of items) {
      const itemId = randomUUID();
      const orderItem: OrderItem = {
        ...insertItem,
        id: itemId,
        orderId,
      };
      this.orderItems.set(itemId, orderItem);
    }

    return order;
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const items = Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === id,
    );

    return { ...order, items };
  }

  // Seed data
  private seedProducts() {
    const products: InsertProduct[] = [
      // Sarees
      {
        name: "Royal Blue Banarasi Silk Saree",
        description:
          "Luxurious Banarasi silk saree with intricate gold zari work and traditional brocade patterns. Perfect for weddings and special occasions.",
        category: "Sarees",
        price: "8999",
        originalPrice: "12999",
        images: [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1610030469527-e0b497050a4c?w=800&h=1000&fit=crop",
        ],
        sizes: ["Free Size"],
        colors: ["Navy Blue", "Gold"],
        fabric: "Silk",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Coral Pink Designer Saree",
        description:
          "Elegant designer saree in coral pink with delicate embroidery and golden border. Ideal for festive celebrations.",
        category: "Sarees",
        price: "6499",
        originalPrice: "9999",
        images: [
          "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=800&h=1000&fit=crop",
        ],
        sizes: ["Free Size"],
        colors: ["Coral Pink", "Gold"],
        fabric: "Chiffon",
        inStock: true,
        featured: true,
        newArrival: true,
      },
      {
        name: "Emerald Green Silk Saree",
        description:
          "Stunning emerald green silk saree with silver embellishments and traditional paisley motifs.",
        category: "Sarees",
        price: "7999",
        images: [
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&h=1000&fit=crop",
        ],
        sizes: ["Free Size"],
        colors: ["Green", "Silver"],
        fabric: "Silk",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "Maroon Cotton Silk Saree",
        description:
          "Traditional maroon cotton silk saree with temple border and classic design.",
        category: "Sarees",
        price: "4999",
        images: [
          "https://images.unsplash.com/photo-1598439210625-5067c578f3f6?w=800&h=1000&fit=crop",
        ],
        sizes: ["Free Size"],
        colors: ["Maroon", "Gold"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: false,
      },

      // Salwar Suits
      {
        name: "Mint Green Salwar Suit Set",
        description:
          "Contemporary mint green salwar kameez with white embroidery and matching dupatta. Perfect for casual wear.",
        category: "Salwar Suits",
        price: "3999",
        originalPrice: "5999",
        images: [
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&h=1000&fit=crop",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Mint Green", "White"],
        fabric: "Cotton",
        inStock: true,
        featured: true,
        newArrival: true,
      },
      {
        name: "Burgundy Velvet Salwar Suit",
        description:
          "Luxurious burgundy velvet salwar suit with intricate embroidery and pearl work.",
        category: "Salwar Suits",
        price: "8499",
        images: [
          "https://images.unsplash.com/photo-1595777216528-071e0127ccf4?w=800&h=1000&fit=crop",
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Burgundy", "Gold"],
        fabric: "Velvet",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Pastel Blue Georgette Suit",
        description:
          "Light and elegant pastel blue georgette suit with delicate thread work.",
        category: "Salwar Suits",
        price: "4499",
        images: [
          "https://images.unsplash.com/photo-1583846792524-97754d5537f2?w=800&h=1000&fit=crop",
        ],
        sizes: ["M", "L", "XL"],
        colors: ["Blue", "White"],
        fabric: "Georgette",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      // Men's Wear
      {
        name: "Premium Gray Three-Piece Suit",
        description:
          "Elegant charcoal gray three-piece suit perfect for formal occasions, business meetings, and special events. Features a well-tailored blazer with notch lapels, matching vest, and slim-fit trousers.",
        category: "Mens Wear",
        price: "5500",
        originalPrice: "10000",
        images: [
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=1000&fit=crop",
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=1000&fit=crop",
        ],
        sizes: ["36", "38", "40", "42", "44", "46"],
        colors: ["Charcoal Gray"],
        fabric: "Wool Blend",
        inStock: true,
        featured: true,
        newArrival: true,
      },
      // Additional Sarees
      {
        name: "Peacock Green Kanjeevaram Silk Saree",
        description:
          "Traditional Kanjeevaram silk saree in peacock green with gold zari border.",
        category: "Sarees",
        price: "9999",
        originalPrice: "14999",
        images: [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800",
        ],
        sizes: ["Free Size"],
        colors: ["Peacock Green", "Gold"],
        fabric: "Kanjeevaram Silk",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Maroon Organza Saree",
        description: "Lightweight organza saree with embroidered border.",
        category: "Sarees",
        price: "3499",
        originalPrice: "5999",
        images: [
          "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=800",
        ],
        sizes: ["Free Size"],
        colors: ["Maroon", "Gold"],
        fabric: "Organza",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "Teal Blue Georgette Saree",
        description: "Elegant georgette saree with sequin work.",
        category: "Sarees",
        price: "2999",
        originalPrice: "4999",
        images: [
          "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800",
        ],
        sizes: ["Free Size"],
        colors: ["Teal Blue"],
        fabric: "Georgette",
        inStock: true,
        featured: false,
        newArrival: false,
      },
      {
        name: "Navy Blue Chiffon Saree",
        description:
          "Elegant navy blue chiffon saree perfect for evening events.",
        category: "Sarees",
        price: "2499",
        originalPrice: "3999",
        images: [
          "https://images.unsplash.com/photo-1598439210625-5067c578f3f6?w=800",
        ],
        sizes: ["Free Size"],
        colors: ["Navy Blue"],
        fabric: "Chiffon",
        inStock: true,
        featured: false,
        newArrival: false,
      },
      {
        name: "Golden Yellow Banarasi Saree",
        description:
          "Pure Banarasi silk saree in golden yellow with intricate weaving.",
        category: "Sarees",
        price: "11999",
        originalPrice: "17999",
        images: [
          "https://images.unsplash.com/photo-1606995399606-bce7f1c71bdc?w=800",
        ],
        sizes: ["Free Size"],
        colors: ["Golden Yellow"],
        fabric: "Banarasi Silk",
        inStock: true,
        featured: true,
        newArrival: true,
      },
      // Additional Salwar Suits
      {
        name: "Peach Anarkali Suit Set",
        description: "Beautiful peach anarkali with heavy embroidery work.",
        category: "Salwar Suits",
        price: "4999",
        originalPrice: "7999",
        images: [
          "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800",
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Peach", "Gold"],
        fabric: "Georgette",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Sky Blue Straight Suit",
        description: "Modern sky blue straight cut suit with gota patti work.",
        category: "Salwar Suits",
        price: "3299",
        originalPrice: "5499",
        images: [
          "https://images.unsplash.com/photo-1595777216528-071e0127ccf4?w=800",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Sky Blue"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "Lavender Palazzo Suit",
        description: "Trendy lavender palazzo suit with mirror work.",
        category: "Salwar Suits",
        price: "2999",
        originalPrice: "4999",
        images: [
          "https://images.unsplash.com/photo-1583846792524-97754d5537f2?w=800",
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Lavender", "Silver"],
        fabric: "Rayon",
        inStock: true,
        featured: false,
        newArrival: false,
      },
      {
        name: "Red Bridal Anarkali",
        description: "Heavy red bridal anarkali with zari and stone work.",
        category: "Salwar Suits",
        price: "12999",
        originalPrice: "18999",
        images: [
          "https://images.unsplash.com/photo-1610030469527-e0b497050a4c?w=800",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Red", "Gold"],
        fabric: "Silk",
        inStock: true,
        featured: true,
        newArrival: true,
      },
      {
        name: "Cream Palazzo Set",
        description: "Elegant cream palazzo set with thread embroidery.",
        category: "Salwar Suits",
        price: "3799",
        originalPrice: "5999",
        images: [
          "https://images.unsplash.com/photo-1609127102567-8a9a21dc27d8?w=800",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Cream"],
        fabric: "Cotton Silk",
        inStock: true,
        featured: false,
        newArrival: false,
      },
      // Additional Kurtis
      {
        name: "White Chikankari Kurti",
        description:
          "Pure white chikankari kurti with intricate hand embroidery.",
        category: "Kurtis",
        price: "1899",
        originalPrice: "2999",
        images: [
          "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800",
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["White"],
        fabric: "Cotton",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Pink Floral Print Kurti",
        description: "Trendy pink kurti with beautiful floral print.",
        category: "Kurtis",
        price: "1299",
        originalPrice: "1999",
        images: [
          "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=800",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Pink"],
        fabric: "Rayon",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "Olive Green Straight Kurti",
        description: "Simple olive green straight kurti for daily wear.",
        category: "Kurtis",
        price: "999",
        originalPrice: "1599",
        images: [
          "https://images.unsplash.com/photo-1585320805574-7a8d005c29f8?w=800",
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Olive Green"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: false,
      },
      {
        name: "Mustard Ethnic Kurti",
        description: "Vibrant mustard kurti with ethnic print.",
        category: "Kurtis",
        price: "1499",
        originalPrice: "2499",
        images: [
          "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Mustard"],
        fabric: "Cotton Silk",
        inStock: true,
        featured: false,
        newArrival: false,
      },
      {
        name: "Black Embroidered Kurti",
        description: "Stylish black kurti with gold embroidery.",
        category: "Kurtis",
        price: "1799",
        originalPrice: "2999",
        images: [
          "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "Gold"],
        fabric: "Georgette",
        inStock: true,
        featured: true,
        newArrival: true,
      },
      // Additional Lehengas
      {
        name: "Royal Blue Bridal Lehenga",
        description: "Stunning royal blue bridal lehenga with heavy work.",
        category: "Lehengas",
        price: "24999",
        originalPrice: "34999",
        images: [
          "https://images.unsplash.com/photo-1583391733956-6c78276477e5?w=800",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Royal Blue", "Gold"],
        fabric: "Silk",
        inStock: true,
        featured: true,
        newArrival: true,
      },
      {
        name: "Pink Net Lehenga",
        description: "Beautiful pink net lehenga with sequin work.",
        category: "Lehengas",
        price: "14999",
        originalPrice: "21999",
        images: [
          "https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=800",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Pink", "Silver"],
        fabric: "Net",
        inStock: true,
        featured: false,
        newArrival: false,
      },
      {
        name: "Red Velvet Lehenga",
        description: "Rich red velvet lehenga perfect for weddings.",
        category: "Lehengas",
        price: "19999",
        originalPrice: "27999",
        images: [
          "https://images.unsplash.com/photo-1608974735003-c1810edf8d5c?w=800",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Red"],
        fabric: "Velvet",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Green Silk Lehenga",
        description: "Elegant green silk lehenga with embroidery.",
        category: "Lehengas",
        price: "17999",
        originalPrice: "24999",
        images: [
          "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Green"],
        fabric: "Silk",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      // Additional Mens Wear
      {
        name: "Black Formal Blazer",
        description: "Premium black formal blazer for business meetings.",
        category: "Mens Wear",
        price: "6999",
        originalPrice: "9999",
        images: [
          "https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=800",
        ],
        sizes: ["36", "38", "40", "42", "44"],
        colors: ["Black"],
        fabric: "Wool Blend",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Navy Blue Suit",
        description: "Classic navy blue two-piece suit.",
        category: "Mens Wear",
        price: "7999",
        originalPrice: "12999",
        images: [
          "https://images.unsplash.com/photo-1593032465729-a-4b0fc6d5a5a5?w=800",
        ],
        sizes: ["36", "38", "40", "42", "44", "46"],
        colors: ["Navy Blue"],
        fabric: "Polyester Blend",
        inStock: true,
        featured: false,
        newArrival: false,
      },
      {
        name: "Brown Formal Jacket",
        description: "Trendy brown formal jacket with modern fit.",
        category: "Mens Wear",
        price: "4999",
        originalPrice: "7999",
        images: [
          "https://images.unsplash.com/photo-1594223828855-f0bd5936a630?w=800",
        ],
        sizes: ["38", "40", "42", "44"],
        colors: ["Brown"],
        fabric: "Cotton Blend",
        inStock: true,
        featured: false,
        newArrival: true,
      },

      // Kurtis
      {
        name: "Yellow Block Print Kurti",
        description:
          "Vibrant yellow kurti with traditional block print patterns and comfortable cotton fabric.",
        category: "Kurtis",
        price: "1999",
        originalPrice: "2999",
        images: [
          "https://images.unsplash.comgenerated_images/kurti_category_product_photo.png",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Yellow", "Orange"],
        fabric: "Cotton",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Navy Blue Embroidered Kurti",
        description:
          "Elegant navy blue kurti with white embroidery and modern silhouette.",
        category: "Kurtis",
        price: "2499",
        images: [
          "https://images.unsplash.comgenerated_images/kurti_category_product_photo.png",
        ],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Navy Blue", "White"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "Pink Floral Print Kurti",
        description:
          "Fresh pink kurti with beautiful floral prints, perfect for summer.",
        category: "Kurtis",
        price: "1799",
        images: [
          "https://images.unsplash.comgenerated_images/kurti_category_product_photo.png",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Pink", "White"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: false,
      },

      // Lehengas
      {
        name: "Magenta Designer Lehenga",
        description:
          "Stunning magenta lehenga choli with heavy embellishments, mirror work, and gold detailing. Perfect for weddings.",
        category: "Lehengas",
        price: "24999",
        originalPrice: "34999",
        images: [
          "https://images.unsplash.comgenerated_images/lehenga_category_product_photo.png",
        ],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Magenta", "Gold"],
        fabric: "Silk",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Emerald Green Bridal Lehenga",
        description:
          "Exquisite emerald green bridal lehenga with golden embroidery and intricate zari work.",
        category: "Lehengas",
        price: "29999",
        images: [
          "https://images.unsplash.comgenerated_images/lehenga_category_product_photo.png",
        ],
        sizes: ["S", "M", "L"],
        colors: ["Green", "Gold"],
        fabric: "Velvet",
        inStock: true,
        featured: true,
        newArrival: true,
      },
      {
        name: "Red and Gold Wedding Lehenga",
        description:
          "Traditional red and gold lehenga with heavy bridal embroidery and sequin work.",
        category: "Lehengas",
        price: "32999",
        images: [
          "https://images.unsplash.comgenerated_images/lehenga_category_product_photo.png",
        ],
        sizes: ["M", "L", "XL"],
        colors: ["Red", "Gold"],
        fabric: "Silk",
        inStock: true,
        featured: false,
        newArrival: true,
      },

      // Men's Wear - 10+ products
      {
        name: "Cream Silk Kurta",
        description: "Traditional cream colored silk kurta with traditional embroidery",
        category: "Mens Wear",
        price: "2499",
        originalPrice: "3999",
        images: ["https://images.unsplash.com/photo-1599599810694-b5ac4dd64b39?w=800"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Cream", "White"],
        fabric: "Silk",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Navy Blue Kurta",
        description: "Navy blue cotton kurta perfect for casual wear and festivals",
        category: "Mens Wear",
        price: "1999",
        originalPrice: "2999",
        images: ["https://images.unsplash.com/photo-1618886996205-e9e66db6b82a?w=800"],
        sizes: ["M", "L", "XL", "XXL"],
        colors: ["Navy Blue"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "Maroon Sherwani",
        description: "Elegant maroon sherwani with gold embroidery for weddings",
        category: "Mens Wear",
        price: "8999",
        originalPrice: "12999",
        images: ["https://images.unsplash.com/photo-1586368917159-1d92f21d1b94?w=800"],
        sizes: ["38", "40", "42", "44"],
        colors: ["Maroon", "Gold"],
        fabric: "Silk",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Black Nehru Jacket",
        description: "Formal black Nehru jacket with subtle pattern",
        category: "Mens Wear",
        price: "3499",
        originalPrice: "5499",
        images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800"],
        sizes: ["38", "40", "42", "44"],
        colors: ["Black"],
        fabric: "Cotton Blend",
        inStock: true,
        featured: false,
        newArrival: false,
      },
      {
        name: "Beige Cotton Kurta",
        description: "Comfortable beige cotton kurta for everyday wear",
        category: "Mens Wear",
        price: "1599",
        originalPrice: "2499",
        images: ["https://images.unsplash.com/photo-1552062407-291a0eac47ee?w=800"],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Beige"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "Golden Embroidered Kurta",
        description: "Luxurious golden kurta with intricate hand embroidery",
        category: "Mens Wear",
        price: "5999",
        originalPrice: "8999",
        images: ["https://images.unsplash.com/photo-1617175637128-c2c3d63cd0a3?w=800"],
        sizes: ["M", "L", "XL"],
        colors: ["Gold", "Cream"],
        fabric: "Silk",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Terracotta Dhoti Set",
        description: "Traditional terracotta dhoti set with matching kurta",
        category: "Mens Wear",
        price: "4499",
        originalPrice: "6999",
        images: ["https://images.unsplash.com/photo-1596777684687-93fe3c3e1d20?w=800"],
        sizes: ["30", "32", "34", "36"],
        colors: ["Terracotta"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: false,
      },
      {
        name: "White Linen Kurta",
        description: "Light and breathable white linen kurta",
        category: "Mens Wear",
        price: "2199",
        originalPrice: "3499",
        images: ["https://images.unsplash.com/photo-1594534475808-b51c528146ee?w=800"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["White"],
        fabric: "Linen",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "Green Silk Kurta",
        description: "Rich green silk kurta with traditional motifs",
        category: "Mens Wear",
        price: "3999",
        originalPrice: "5999",
        images: ["https://images.unsplash.com/photo-1612033873562-f1c4e06419dd?w=800"],
        sizes: ["M", "L", "XL"],
        colors: ["Green"],
        fabric: "Silk",
        inStock: true,
        featured: false,
        newArrival: false,
      },
      {
        name: "Charcoal Kurta Pajama",
        description: "Charcoal grey kurta pajama set for formal occasions",
        category: "Mens Wear",
        price: "3299",
        originalPrice: "4999",
        images: ["https://images.unsplash.com/photo-1617875537368-3528d8fab7ac?w=800"],
        sizes: ["M", "L", "XL", "XXL"],
        colors: ["Charcoal"],
        fabric: "Cotton Blend",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "Rust Velvet Sherwani",
        description: "Luxurious rust velvet sherwani with gold accents for weddings",
        category: "Mens Wear",
        price: "9999",
        originalPrice: "14999",
        images: ["https://images.unsplash.com/photo-1598042368797-4bfd8c81c19e?w=800"],
        sizes: ["38", "40", "42"],
        colors: ["Rust", "Gold"],
        fabric: "Velvet",
        inStock: true,
        featured: true,
        newArrival: true,
      },

      // Kids Wear - 10+ products
      {
        name: "Pink Lehenga Set for Girls",
        description: "Beautiful pink lehenga set with golden embroidery for girls",
        category: "Kids Wear",
        price: "1999",
        originalPrice: "2999",
        images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800"],
        sizes: ["4", "6", "8", "10"],
        colors: ["Pink", "Gold"],
        fabric: "Cotton Silk",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Blue Kurta for Boys",
        description: "Comfortable blue kurta designed for boys",
        category: "Kids Wear",
        price: "999",
        originalPrice: "1499",
        images: ["https://images.unsplash.com/photo-1609223874033-3f8b5e7b5b5?w=800"],
        sizes: ["2", "4", "6", "8"],
        colors: ["Blue"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "Red Ghagra Choli",
        description: "Traditional red ghagra choli for girls",
        category: "Kids Wear",
        price: "1599",
        originalPrice: "2299",
        images: ["https://images.unsplash.com/photo-1577720643272-265e434a0b96?w=800"],
        sizes: ["4", "6", "8"],
        colors: ["Red", "Gold"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: false,
      },
      {
        name: "Yellow Ethnic Dress for Girls",
        description: "Bright yellow ethnic dress with embroidered details",
        category: "Kids Wear",
        price: "1299",
        originalPrice: "1899",
        images: ["https://images.unsplash.com/photo-1599599810224-8d5d0d52b418?w=800"],
        sizes: ["2", "4", "6", "8", "10"],
        colors: ["Yellow"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "Green Kurta Pajama Set",
        description: "Green kurta pajama set for kids",
        category: "Kids Wear",
        price: "1199",
        originalPrice: "1799",
        images: ["https://images.unsplash.com/photo-1595777707802-07a84eb7ced0?w=800"],
        sizes: ["4", "6", "8"],
        colors: ["Green"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: false,
      },
      {
        name: "Maroon Sherwani for Boys",
        description: "Kids maroon sherwani for celebrations",
        category: "Kids Wear",
        price: "2499",
        originalPrice: "3999",
        images: ["https://images.unsplash.com/photo-1603566696411-07134e71a2a9?w=800"],
        sizes: ["4", "6", "8"],
        colors: ["Maroon", "Gold"],
        fabric: "Silk",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Purple Lehenga for Girls",
        description: "Elegant purple lehenga with silver embroidery",
        category: "Kids Wear",
        price: "2199",
        originalPrice: "3299",
        images: ["https://images.unsplash.com/photo-1619451334792-150a96749a26?w=800"],
        sizes: ["6", "8", "10"],
        colors: ["Purple", "Silver"],
        fabric: "Cotton Silk",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "White Mundu for Boys",
        description: "Traditional white mundu for kids",
        category: "Kids Wear",
        price: "899",
        originalPrice: "1299",
        images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800"],
        sizes: ["2", "4", "6", "8"],
        colors: ["White"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: false,
      },
      {
        name: "Orange Ethnic Dress",
        description: "Vibrant orange ethnic dress for girls with traditional prints",
        category: "Kids Wear",
        price: "1399",
        originalPrice: "2099",
        images: ["https://images.unsplash.com/photo-1616238619298-3b7148d03e67?w=800"],
        sizes: ["4", "6", "8"],
        colors: ["Orange"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "Navy Blue Dhoti Set",
        description: "Navy blue dhoti set for kids",
        category: "Kids Wear",
        price: "999",
        originalPrice: "1599",
        images: ["https://images.unsplash.com/photo-1535718635595-e14dbc56d201?w=800"],
        sizes: ["4", "6", "8"],
        colors: ["Navy Blue"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: false,
      },
      {
        name: "Gold Silk Lehenga Set",
        description: "Luxurious gold silk lehenga set for special occasions",
        category: "Kids Wear",
        price: "2899",
        originalPrice: "4299",
        images: ["https://images.unsplash.com/photo-1596515897033-c390a04dae14?w=800"],
        sizes: ["6", "8", "10"],
        colors: ["Gold"],
        fabric: "Silk",
        inStock: true,
        featured: true,
        newArrival: false,
      },

      // Bags - 8 products
      {
        name: "Embroidered Handbag",
        description: "Beautiful embroidered handbag with traditional Indian patterns",
        category: "Bags",
        price: "1999",
        originalPrice: "2999",
        images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"],
        sizes: ["One Size"],
        colors: ["Multi"],
        fabric: "Fabric",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Silk Clutch",
        description: "Elegant silk clutch with golden zari work",
        category: "Bags",
        price: "1499",
        originalPrice: "2299",
        images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"],
        sizes: ["One Size"],
        colors: ["Red", "Gold"],
        fabric: "Silk",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "Cotton Tote Bag",
        description: "Spacious cotton tote bag with traditional prints",
        category: "Bags",
        price: "999",
        originalPrice: "1499",
        images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"],
        sizes: ["One Size"],
        colors: ["Beige", "Brown"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: false,
      },
      {
        name: "Sling Bag with Embroidery",
        description: "Compact sling bag with beautiful embroidery",
        category: "Bags",
        price: "1299",
        originalPrice: "1999",
        images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"],
        sizes: ["One Size"],
        colors: ["Purple", "Gold"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "Potli Bag",
        description: "Traditional potli bag with beads and mirror work",
        category: "Bags",
        price: "899",
        originalPrice: "1399",
        images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"],
        sizes: ["One Size"],
        colors: ["Navy", "Gold"],
        fabric: "Fabric",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Velvet Backpack",
        description: "Soft velvet backpack with ethnic designs",
        category: "Bags",
        price: "1799",
        originalPrice: "2699",
        images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"],
        sizes: ["One Size"],
        colors: ["Burgundy"],
        fabric: "Velvet",
        inStock: true,
        featured: false,
        newArrival: false,
      },
      {
        name: "Jacquard Handbag",
        description: "Stylish jacquard handbag with traditional patterns",
        category: "Bags",
        price: "1599",
        originalPrice: "2499",
        images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"],
        sizes: ["One Size"],
        colors: ["Green", "Gold"],
        fabric: "Jacquard",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "Leather Crossbody Bag",
        description: "Premium leather crossbody bag with ethnic detailing",
        category: "Bags",
        price: "2499",
        originalPrice: "3999",
        images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"],
        sizes: ["One Size"],
        colors: ["Brown"],
        fabric: "Leather",
        inStock: true,
        featured: true,
        newArrival: false,
      },
    ];

    products.forEach((p) => {
      const id = randomUUID();
      const product: Product = {
        ...p,
        id,
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        reviewCount: Math.floor(Math.random() * 50) + 5,
      };
      this.products.set(id, product);
    });
  }
}

export const storage = new MemStorage();
