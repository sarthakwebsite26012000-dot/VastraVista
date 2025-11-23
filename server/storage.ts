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
  }): Promise<Product[]> {
    let products = Array.from(this.products.values());

    // Apply filters
    if (filters?.category) {
      const categoryMap: Record<string, string> = {
        "sarees": "Sarees",
        "salwar-suits": "Salwar Suits",
        "kurtis": "Kurtis",
        "lehengas": "Lehengas",
      };
      const categoryName = categoryMap[filters.category] || filters.category;
      products = products.filter((p) => p.category === categoryName);
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
        filters.sizes!.some((size) => p.sizes.includes(size))
      );
    }

    if (filters?.colors && filters.colors.length > 0) {
      products = products.filter((p) =>
        filters.colors!.some((color) => p.colors.includes(color))
      );
    }

    if (filters?.fabrics && filters.fabrics.length > 0) {
      products = products.filter((p) =>
        filters.fabrics!.includes(p.fabric)
      );
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
            (a, b) =>
              parseFloat(b.rating || "0") - parseFloat(a.rating || "0")
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
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
      (item) => item.sessionId === sessionId
    );
  }

  async getCartItemsWithProducts(
    sessionId: string
  ): Promise<CartItemWithProduct[]> {
    const items = await this.getCartItems(sessionId);
    return Promise.all(
      items.map(async (item) => {
        const product = await this.getProduct(item.productId);
        return { ...item, product: product! };
      })
    );
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existing = Array.from(this.cartItems.values()).find(
      (item) =>
        item.sessionId === insertItem.sessionId &&
        item.productId === insertItem.productId &&
        item.size === insertItem.size &&
        item.color === insertItem.color
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
    quantity: number
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
    items: InsertOrderItem[]
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
      (item) => item.orderId === id
    );

    return { ...order, items };
  }

  // Seed data
  private seedProducts() {
    const products: InsertProduct[] = [
      // Sarees
      {
        name: "Royal Blue Banarasi Silk Saree",
        description: "Luxurious Banarasi silk saree with intricate gold zari work and traditional brocade patterns. Perfect for weddings and special occasions.",
        category: "Sarees",
        price: "8999",
        originalPrice: "12999",
        images: [
          "/attached_assets/generated_images/premium_saree_product_detail.png",
          "/attached_assets/generated_images/saree_category_product_photo.png",
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
        description: "Elegant designer saree in coral pink with delicate embroidery and golden border. Ideal for festive celebrations.",
        category: "Sarees",
        price: "6499",
        originalPrice: "9999",
        images: ["/attached_assets/generated_images/saree_category_product_photo.png"],
        sizes: ["Free Size"],
        colors: ["Coral Pink", "Gold"],
        fabric: "Chiffon",
        inStock: true,
        featured: true,
        newArrival: true,
      },
      {
        name: "Emerald Green Silk Saree",
        description: "Stunning emerald green silk saree with silver embellishments and traditional paisley motifs.",
        category: "Sarees",
        price: "7999",
        images: ["/attached_assets/generated_images/saree_category_product_photo.png"],
        sizes: ["Free Size"],
        colors: ["Green", "Silver"],
        fabric: "Silk",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "Maroon Cotton Silk Saree",
        description: "Traditional maroon cotton silk saree with temple border and classic design.",
        category: "Sarees",
        price: "4999",
        images: ["/attached_assets/generated_images/saree_category_product_photo.png"],
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
        description: "Contemporary mint green salwar kameez with white embroidery and matching dupatta. Perfect for casual wear.",
        category: "Salwar Suits",
        price: "3999",
        originalPrice: "5999",
        images: ["/attached_assets/generated_images/salwar_suit_category_photo.png"],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Mint Green", "White"],
        fabric: "Cotton",
        inStock: true,
        featured: true,
        newArrival: true,
      },
      {
        name: "Burgundy Velvet Salwar Suit",
        description: "Luxurious burgundy velvet salwar suit with intricate embroidery and pearl work.",
        category: "Salwar Suits",
        price: "8499",
        images: ["/attached_assets/generated_images/salwar_suit_category_photo.png"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Burgundy", "Gold"],
        fabric: "Velvet",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Pastel Blue Georgette Suit",
        description: "Light and elegant pastel blue georgette suit with delicate thread work.",
        category: "Salwar Suits",
        price: "4499",
        images: ["/attached_assets/generated_images/salwar_suit_category_photo.png"],
        sizes: ["M", "L", "XL"],
        colors: ["Blue", "White"],
        fabric: "Georgette",
        inStock: true,
        featured: false,
        newArrival: true,
      },

      // Kurtis
      {
        name: "Yellow Block Print Kurti",
        description: "Vibrant yellow kurti with traditional block print patterns and comfortable cotton fabric.",
        category: "Kurtis",
        price: "1999",
        originalPrice: "2999",
        images: ["/attached_assets/generated_images/kurti_category_product_photo.png"],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Yellow", "Orange"],
        fabric: "Cotton",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Navy Blue Embroidered Kurti",
        description: "Elegant navy blue kurti with white embroidery and modern silhouette.",
        category: "Kurtis",
        price: "2499",
        images: ["/attached_assets/generated_images/kurti_category_product_photo.png"],
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Navy Blue", "White"],
        fabric: "Cotton",
        inStock: true,
        featured: false,
        newArrival: true,
      },
      {
        name: "Pink Floral Print Kurti",
        description: "Fresh pink kurti with beautiful floral prints, perfect for summer.",
        category: "Kurtis",
        price: "1799",
        images: ["/attached_assets/generated_images/kurti_category_product_photo.png"],
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
        description: "Stunning magenta lehenga choli with heavy embellishments, mirror work, and gold detailing. Perfect for weddings.",
        category: "Lehengas",
        price: "24999",
        originalPrice: "34999",
        images: ["/attached_assets/generated_images/lehenga_category_product_photo.png"],
        sizes: ["S", "M", "L", "XL"],
        colors: ["Magenta", "Gold"],
        fabric: "Silk",
        inStock: true,
        featured: true,
        newArrival: false,
      },
      {
        name: "Emerald Green Bridal Lehenga",
        description: "Exquisite emerald green bridal lehenga with golden embroidery and intricate zari work.",
        category: "Lehengas",
        price: "29999",
        images: ["/attached_assets/generated_images/lehenga_category_product_photo.png"],
        sizes: ["S", "M", "L"],
        colors: ["Green", "Gold"],
        fabric: "Velvet",
        inStock: true,
        featured: true,
        newArrival: true,
      },
      {
        name: "Red and Gold Wedding Lehenga",
        description: "Traditional red and gold lehenga with heavy bridal embroidery and sequin work.",
        category: "Lehengas",
        price: "32999",
        images: ["/attached_assets/generated_images/lehenga_category_product_photo.png"],
        sizes: ["M", "L", "XL"],
        colors: ["Red", "Gold"],
        fabric: "Silk",
        inStock: true,
        featured: false,
        newArrival: true,
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
