import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilter } from "@/components/ProductFilter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { useLocation } from "wouter";

interface ProductListingProps {
  category?: string;
}

export default function ProductListing({ category }: ProductListingProps) {
  const [location] = useLocation();
  const searchQuery = new URLSearchParams(window.location.search).get("q") || "";

  const [filters, setFilters] = useState({
    category: category || "",
    priceRange: [0, 50000] as [number, number],
    sizes: [] as string[],
    colors: [] as string[],
    fabrics: [] as string[],
    search: "",
  });
  const [sortBy, setSortBy] = useState("featured");

  // Update filters when search query or category changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchQuery,
      category: category || "",
    }));
  }, [searchQuery, category, location]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { ...filters, sortBy }],
  });

  const categoryTitles: Record<string, string> = {
    sarees: "Sarees",
    "salwar-suits": "Salwar Suits",
    kurtis: "Kurtis",
    lehengas: "Lehengas",
    "mens-wear": "Men's Wear",
    "kids-wear": "Kids Wear",
    bags: "Bags",
  };

  // Determine title based on search or category
  let title = "All Products";
  if (searchQuery) {
    title = `Search Results for "${searchQuery}"`;
  } else if (category) {
    title = categoryTitles[category] || category;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">
            {title}
          </h1>
          <p className="text-muted-foreground font-decorative italic text-lg">
            {searchQuery ? "Browse search results" : "Discover our exquisite collection"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start">
            <Card className="p-6">
              <ProductFilter filters={filters} onFilterChange={setFilters} />
            </Card>
          </aside>

          {/* Products */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-2">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden" data-testid="button-filters-mobile">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <ProductFilter filters={filters} onFilterChange={setFilters} />
                    </div>
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-muted-foreground">
                  {products.length} products
                </p>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <Card key={i} className="h-96 animate-pulse bg-muted" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground mb-4">
                  No products found matching your criteria
                </p>
                <Button variant="outline" onClick={() => setFilters({
                  category: category || "",
                  priceRange: [0, 50000],
                  sizes: [],
                  colors: [],
                  fabrics: [],
                  search: searchQuery,
                })} data-testid="button-clear-filters-empty">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
