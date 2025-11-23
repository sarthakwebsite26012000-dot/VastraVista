import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CartItemWithProduct } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Check } from "lucide-react";

const checkoutSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  shippingAddress: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(6, "ZIP code must be at least 6 digits"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const steps = ["Shipping", "Payment", "Review"];

export default function Checkout() {
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart/items"],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const sessionId = localStorage.getItem("sessionId");
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
        0
      );

      return apiRequest("POST", "/api/orders", {
        ...data,
        totalAmount: totalAmount.toString(),
        sessionId,
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cart/items"] });
      toast({
        title: "Order placed successfully!",
        description: "You will receive a confirmation email shortly.",
      });
      setLocation(`/order/${data.orderId}`);
    },
    onError: () => {
      toast({
        title: "Order failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    if (currentStep === 0) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      createOrderMutation.mutate(data);
    }
  };

  const formData = watch();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );
  const shipping = subtotal >= 2000 ? 0 : 100;
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Your cart is empty</p>
        <Button onClick={() => setLocation("/products")} data-testid="button-continue-shopping-empty-checkout">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-serif font-bold mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      index < currentStep
                        ? "bg-primary text-primary-foreground"
                        : index === currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                  </div>
                  <span className="text-sm mt-2 font-medium">{step}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 ${
                      index < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold">
                      Shipping Information
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerName">Full Name *</Label>
                        <Input
                          id="customerName"
                          {...register("customerName")}
                          placeholder="John Doe"
                          data-testid="input-name"
                        />
                        {errors.customerName && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.customerName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="customerEmail">Email *</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          {...register("customerEmail")}
                          placeholder="john@example.com"
                          data-testid="input-email"
                        />
                        {errors.customerEmail && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.customerEmail.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="customerPhone">Phone Number *</Label>
                      <Input
                        id="customerPhone"
                        {...register("customerPhone")}
                        placeholder="+91 98765 43210"
                        data-testid="input-phone"
                      />
                      {errors.customerPhone && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.customerPhone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="shippingAddress">Street Address *</Label>
                      <Input
                        id="shippingAddress"
                        {...register("shippingAddress")}
                        placeholder="123 Main Street, Apartment 4B"
                        data-testid="input-address"
                      />
                      {errors.shippingAddress && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.shippingAddress.message}
                        </p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          {...register("city")}
                          placeholder="Mumbai"
                          data-testid="input-city"
                        />
                        {errors.city && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.city.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          {...register("state")}
                          placeholder="Maharashtra"
                          data-testid="input-state"
                        />
                        {errors.state && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.state.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          {...register("zipCode")}
                          placeholder="400001"
                          data-testid="input-zip"
                        />
                        {errors.zipCode && (
                          <p className="text-sm text-destructive mt-1">
                            {errors.zipCode.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold">
                      Payment Method
                    </h2>
                    <p className="text-muted-foreground">
                      Payment will be processed securely using Stripe. You'll be
                      redirected to complete your payment after reviewing your
                      order.
                    </p>
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        🔒 Your payment information is secure and encrypted
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-serif font-bold">
                      Review Order
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Shipping Address</h3>
                        <div className="text-sm text-muted-foreground">
                          <p>{formData.customerName}</p>
                          <p>{formData.shippingAddress}</p>
                          <p>
                            {formData.city}, {formData.state} {formData.zipCode}
                          </p>
                          <p>{formData.customerPhone}</p>
                          <p>{formData.customerEmail}</p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-semibold mb-2">Order Items</h3>
                        <div className="space-y-3">
                          {cartItems.map((item) => (
                            <div key={item.id} className="flex gap-3 text-sm">
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="w-16 h-20 object-cover rounded-md"
                              />
                              <div className="flex-1">
                                <p className="font-medium">
                                  {item.product.name}
                                </p>
                                <p className="text-muted-foreground">
                                  Size: {item.size}, Color: {item.color}
                                </p>
                                <p className="text-muted-foreground">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <p className="font-semibold">
                                ₹
                                {(
                                  parseFloat(item.product.price) * item.quantity
                                ).toLocaleString("en-IN")}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      data-testid="button-back"
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createOrderMutation.isPending}
                    data-testid="button-continue"
                  >
                    {currentStep === 2
                      ? createOrderMutation.isPending
                        ? "Placing Order..."
                        : "Place Order"
                      : "Continue"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-serif font-bold mb-4">
                Order Summary
              </h3>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1 text-sm">
                      <p className="font-medium line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-muted-foreground">
                        {item.size} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      ₹
                      {(
                        parseFloat(item.product.price) * item.quantity
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-primary font-medium">FREE</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span data-testid="text-order-total">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
