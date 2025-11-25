import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercent = hasDiscount
    ? Math.round(
        ((parseFloat(product.originalPrice!) - parseFloat(product.price)) /
          parseFloat(product.originalPrice!)) *
          100
      )
    : 0;

  return (
    <Card className="group overflow-hidden bg-background border-0 hover-elevate active-elevate-2" data-testid={`card-product-${product.id}`}>
      <CardContent className="p-0">
        <Link href={`/product/${product.id}`}>
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
            />
            {hasDiscount && (
              <Badge className="absolute top-4 left-4 bg-foreground text-background font-black text-xs" data-testid={`badge-discount-${product.id}`}>
                {discountPercent}% OFF
              </Badge>
            )}
            {product.newArrival && (
              <Badge className="absolute top-4 right-4 bg-foreground text-background font-black text-xs" data-testid={`badge-new-${product.id}`}>
                NEW
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-background opacity-0 group-hover:opacity-100 transition-opacity"
              data-testid={`button-wishlist-${product.id}`}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </Link>
        <div className="p-4 space-y-3">
          <Link href={`/product/${product.id}`}>
            <h3 className="font-black text-sm uppercase line-clamp-2 group-hover:underline transition-all" data-testid={`text-product-name-${product.id}`}>
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground uppercase">{product.fabric}</p>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-foreground text-foreground" />
            <span className="text-xs font-bold" data-testid={`text-rating-${product.id}`}>
              {parseFloat(product.rating || "0").toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
          <div className="flex items-baseline gap-2 pt-2 border-t border-border">
            <span className="text-xl font-black" data-testid={`text-price-${product.id}`}>
              ₹{parseFloat(product.price).toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through" data-testid={`text-original-price-${product.id}`}>
                ₹{parseFloat(product.originalPrice!).toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
