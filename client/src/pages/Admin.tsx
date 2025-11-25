import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Product, Order } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Plus, Edit, Trash2, Eye, Package, ShoppingCart, TrendingUp, X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "sarthak@26012000";

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  price: z.string().min(1, "Price is required"),
  originalPrice: z.string().optional(),
  fabric: z.string().min(1, "Fabric is required"),
  featured: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  inStock: z.boolean().default(true),
  images: z.array(z.string()).min(1, "At least one image is required"),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const { toast } = useToast();

  const mockOrders: Order[] = [
    {
      id: "ORD001",
      customerName: "Priya Sharma",
      customerEmail: "priya@example.com",
      customerPhone: "9876543210",
      shippingAddress: "123 Main St",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      totalAmount: "15999",
      status: "shipped",
      trackingNumber: "TRK12345",
      paymentIntentId: "pi_123",
      createdAt: new Date(),
    },
    {
      id: "ORD002",
      customerName: "Anita Patel",
      customerEmail: "anita@example.com",
      customerPhone: "9876543211",
      shippingAddress: "456 Oak Ave",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110001",
      totalAmount: "24999",
      status: "delivered",
      trackingNumber: "TRK67890",
      paymentIntentId: "pi_456",
      createdAt: new Date(),
    },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsLoggedIn(true);
      setPassword("");
      toast({ title: "Login successful" });
    } else {
      toast({
        title: "Invalid password",
        variant: "destructive",
      });
    }
  };

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: editingProduct || { inStock: true, images: [] },
  });

  const inStockValue = watch("inStock");

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted" });
    },
  });

  const handleAddImage = () => {
    if (!imageInput.trim()) {
      toast({
        title: "Image URL required",
        variant: "destructive",
      });
      return;
    }
    if (imageUrls.length >= 5) {
      toast({
        title: "Maximum 5 images allowed",
        variant: "destructive",
      });
      return;
    }
    setImageUrls([...imageUrls, imageInput]);
    setImageInput("");
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const onSubmit = (data: ProductFormData) => {
    if (imageUrls.length === 0) {
      toast({
        title: "At least one image is required",
        variant: "destructive",
      });
      return;
    }
    toast({ title: editingProduct ? "Product updated" : "Product created" });
    reset();
    setShowProductDialog(false);
    setEditingProduct(null);
    setImageUrls([]);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-6">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-3xl font-serif font-bold mb-2 text-center">
            Admin Login
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Elegant Ethnic Management Dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="mt-2"
                data-testid="input-admin-password"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" data-testid="button-admin-login">
              Login
            </Button>
          </form>

          <Separator className="my-6" />

          <p className="text-xs text-center text-muted-foreground">
            This is a secure admin panel. Only authorized personnel should access this area.
          </p>
        </Card>
      </div>
    );
  }

  const totalProducts = products.length;
  const totalOrders = mockOrders.length;
  const totalRevenue = mockOrders.reduce(
    (sum, order) => sum + parseFloat(order.totalAmount),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="sticky top-0 z-40 bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Elegant Ethnic Management</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setIsLoggedIn(false);
              setPassword("");
            }}
            data-testid="button-admin-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-3xl font-bold mt-2">{totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-3xl font-bold mt-2">{totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold mt-2">
                  ₹{totalRevenue.toLocaleString("en-IN")}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2" data-testid="tabs-admin">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold">Product Management</h2>
              <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingProduct(null);
                      reset();
                      setImageUrls([]);
                    }}
                    data-testid="button-add-product"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Product Name *</Label>
                        <Input
                          {...register("name")}
                          placeholder="E.g., Royal Blue Saree"
                          data-testid="input-product-name"
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label>Category *</Label>
                        <Input
                          {...register("category")}
                          placeholder="E.g., Sarees"
                          data-testid="input-product-category"
                        />
                        {errors.category && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.category.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label>Price (₹) *</Label>
                        <Input
                          {...register("price")}
                          type="number"
                          placeholder="9999"
                          data-testid="input-product-price"
                        />
                        {errors.price && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.price.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label>Original Price (₹)</Label>
                        <Input
                          {...register("originalPrice")}
                          type="number"
                          placeholder="14999"
                          data-testid="input-product-original-price"
                        />
                      </div>

                      <div>
                        <Label>Fabric *</Label>
                        <Input
                          {...register("fabric")}
                          placeholder="E.g., Silk"
                          data-testid="input-product-fabric"
                        />
                        {errors.fabric && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.fabric.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Description *</Label>
                      <Textarea
                        {...register("description")}
                        placeholder="Product description..."
                        rows={3}
                        data-testid="textarea-product-description"
                      />
                      {errors.description && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    {/* Stock Management */}
                    <div className="flex items-center justify-between p-3 bg-card border rounded-md">
                      <Label className="text-sm font-medium">Stock Status</Label>
                      <Controller
                        name="inStock"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-in-stock"
                          />
                        )}
                      />
                    </div>

                    {/* Product Images */}
                    <div>
                      <Label className="text-base font-semibold mb-2 block">
                        Product Images (up to 5) *
                      </Label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={imageInput}
                            onChange={(e) => setImageInput(e.target.value)}
                            placeholder="Paste Unsplash image URL (e.g., https://images.unsplash.com/...)"
                            data-testid="input-image-url"
                          />
                          <Button
                            type="button"
                            onClick={handleAddImage}
                            variant="outline"
                            data-testid="button-add-image"
                          >
                            Add
                          </Button>
                        </div>
                        {errors.images && (
                          <p className="text-sm text-destructive">
                            {errors.images.message}
                          </p>
                        )}
                      </div>

                      {/* Image Previews */}
                      {imageUrls.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          {imageUrls.map((url, index) => (
                            <div
                              key={index}
                              className="relative group aspect-square rounded-md overflow-hidden bg-muted border"
                            >
                              <img
                                src={url}
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground rounded-full p-1"
                                data-testid={`button-remove-image-${index}`}
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <span className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                {index + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register("featured")}
                          data-testid="checkbox-featured"
                        />
                        <span className="text-sm">Featured</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register("newArrival")}
                          data-testid="checkbox-new-arrival"
                        />
                        <span className="text-sm">New Arrival</span>
                      </label>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowProductDialog(false);
                          setEditingProduct(null);
                          setImageUrls([]);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        data-testid="button-save-product"
                      >
                        {editingProduct ? "Update Product" : "Add Product"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {productsLoading ? (
              <p className="text-muted-foreground">Loading products...</p>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.slice(0, 10).map((product) => (
                        <TableRow key={product.id} data-testid={`product-row-${product.id}`}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>₹{parseFloat(product.price).toLocaleString("en-IN")}</TableCell>
                          <TableCell>
                            <Badge
                              variant={product.inStock ? "default" : "secondary"}
                            >
                              {product.inStock ? "In Stock" : "Out"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowProductDialog(true);
                                }}
                                data-testid={`button-edit-product-${product.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() =>
                                  deleteProductMutation.mutate(product.id)
                                }
                                data-testid={`button-delete-product-${product.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-serif font-bold">Order Management</h2>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOrders.map((order) => (
                      <TableRow key={order.id} data-testid={`order-row-${order.id}`}>
                        <TableCell className="font-mono text-sm">{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>₹{parseFloat(order.totalAmount).toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "delivered"
                                ? "default"
                                : order.status === "shipped"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="outline"
                            data-testid={`button-view-order-${order.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
