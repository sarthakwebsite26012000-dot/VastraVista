import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCartItemSchema, insertReviewSchema, insertOrderSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { category, sortBy, priceRange, sizes, colors, fabrics, search } = req.query;
      
      const filters: any = { sortBy: sortBy as string };
      
      if (category && category !== "bags-") filters.category = category as string;
      if (priceRange) {
        const [min, max] = (priceRange as string).split(",").map(Number);
        filters.priceRange = [min, max];
      }
      if (sizes) filters.sizes = (sizes as string).split(",");
      if (colors) filters.colors = (colors as string).split(",");
      if (fabrics) filters.fabrics = (fabrics as string).split(",");
      if (search) filters.search = search as string;

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Reviews
  app.get("/api/reviews/:productId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProduct(req.params.productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.json(review);
    } catch (error) {
      res.status(400).json({ error: "Invalid review data" });
    }
  });

  // Cart
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string || req.headers["x-session-id"] as string;
      if (!sessionId) {
        return res.json([]);
      }
      const items = await storage.getCartItems(sessionId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.get("/api/cart/items", async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string || req.headers["x-session-id"] as string;
      if (!sessionId) {
        return res.json([]);
      }
      const items = await storage.getCartItemsWithProducts(sessionId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse(req.body);
      const item = await storage.addToCart(validatedData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid cart item data" });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: "Invalid quantity" });
      }
      const item = await storage.updateCartItem(req.params.id, quantity);
      if (!item) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const success = await storage.removeFromCart(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  // Orders
  app.post("/api/orders", async (req, res) => {
    try {
      const { sessionId, ...orderData } = req.body;
      const validatedOrder = insertOrderSchema.parse(orderData);

      // Get cart items
      const cartItems = await storage.getCartItemsWithProducts(sessionId);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      // Create order items
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        productImage: item.product.images[0],
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.product.price,
      }));

      // Create order
      const order = await storage.createOrder(validatedOrder, orderItems);

      // Clear cart
      await storage.clearCart(sessionId);

      res.json({ orderId: order.id });
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(400).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
