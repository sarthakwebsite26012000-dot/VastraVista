import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { OrderWithItems } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check, Package, Truck, MapPin, Home } from "lucide-react";

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: Home },
];

export default function OrderTracking() {
  const { id } = useParams();

  const { data: order, isLoading } = useQuery<OrderWithItems>({
    queryKey: ["/api/orders", id],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Order not found</p>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const currentStatusIndex = statusSteps.findIndex(
    (step) => step.key === order.status
  );

  const estimatedDelivery = new Date(order.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Success Header */}
        <Card className="p-8 text-center mb-8 bg-primary/5 border-primary/20">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-2">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground mb-4">
            Thank you for your purchase. Your order has been received and is
            being processed.
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Order ID:</span>
            <Badge variant="outline" className="font-mono" data-testid="text-order-id">
              {order.id}
            </Badge>
          </div>
        </Card>

        {/* Order Status Timeline */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-serif font-bold mb-8">Order Status</h2>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
            <div
              className="absolute left-6 top-0 w-0.5 bg-primary transition-all duration-500"
              style={{
                height: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
              }}
            />

            {/* Timeline Steps */}
            <div className="space-y-8">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="relative flex items-start gap-4">
                    <div
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 pt-2">
                      <h3
                        className={`font-semibold ${
                          isCompleted ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </h3>
                      {isCurrent && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Current status
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {order.trackingNumber && (
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tracking Number
                  </p>
                  <p className="font-mono font-semibold" data-testid="text-tracking-number">
                    {order.trackingNumber}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Track Package
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Estimated Delivery:{" "}
              <span className="font-semibold text-foreground">
                {estimatedDelivery.toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </p>
          </div>
        </Card>

        {/* Order Details */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-serif font-bold mb-6">Order Details</h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4" data-testid={`order-item-${item.id}`}>
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-20 h-24 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.productName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Size: {item.size}, Color: {item.color}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">
                  ₹
                  {(
                    parseFloat(item.price) * item.quantity
                  ).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>
                ₹
                {order.items
                  .reduce(
                    (sum, item) => sum + parseFloat(item.price) * item.quantity,
                    0
                  )
                  .toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-primary font-medium">FREE</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span data-testid="text-order-total">
                ₹{parseFloat(order.totalAmount).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </Card>

        {/* Shipping Address */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-serif font-bold mb-4">
            Shipping Address
          </h2>
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground">{order.customerName}</p>
            <p>{order.shippingAddress}</p>
            <p>
              {order.city}, {order.state} {order.zipCode}
            </p>
            <p className="mt-2">{order.customerPhone}</p>
            <p>{order.customerEmail}</p>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/products" className="flex-1">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
          <Button variant="default" className="flex-1" data-testid="button-contact-support">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}
