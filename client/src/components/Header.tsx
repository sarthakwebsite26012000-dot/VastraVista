import { ShoppingCart, Search, User, Menu, Heart, ChevronDown, Shirt, Package, Baby, Dress, Shoe, Watch, Zap } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CartItem } from "@shared/schema";

interface MenuCategory {
  name: string;
  icon: React.ReactNode;
  subcategories: { label: string; path: string }[];
}

const mainCategories: MenuCategory[] = [
  {
    name: "Men",
    icon: <Shirt className="h-5 w-5" />,
    subcategories: [
      { label: "Topwear", path: "/products/mens/topwear" },
      { label: "Bottomwear", path: "/products/mens/bottomwear" },
      { label: "Ethnicwear", path: "/products/mens/ethnicwear" },
      { label: "Footwear", path: "/products/mens/footwear" },
      { label: "Accessories", path: "/products/mens/accessories" },
    ],
  },
  {
    name: "Women",
    icon: <Dress className="h-5 w-5" />,
    subcategories: [
      { label: "Sarees", path: "/products/sarees" },
      { label: "Salwar Suits", path: "/products/salwar-suits" },
      { label: "Kurtis", path: "/products/kurtis" },
      { label: "Lehengas", path: "/products/lehengas" },
      { label: "Topwear", path: "/products/women/topwear" },
      { label: "Bottomwear", path: "/products/women/bottomwear" },
      { label: "Dresses", path: "/products/women/dresses" },
      { label: "Footwear", path: "/products/women/footwear" },
      { label: "Accessories", path: "/products/women/accessories" },
    ],
  },
  {
    name: "Kids",
    icon: <Baby className="h-5 w-5" />,
    subcategories: [
      { label: "Boys Topwear", path: "/products/kids/boys/topwear" },
      { label: "Boys Bottomwear", path: "/products/kids/boys/bottomwear" },
      { label: "Boys Ethnicwear", path: "/products/kids/boys/ethnicwear" },
      { label: "Girls Dresses", path: "/products/kids/girls/dresses" },
      { label: "Girls Ethnicwear", path: "/products/kids/girls/ethnicwear" },
      { label: "Girls Topwear", path: "/products/kids/girls/topwear" },
    ],
  },
];

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const { data: cartItems = [] } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link href="/" data-testid="link-home">
            <div className="flex items-center cursor-pointer hover-elevate active-elevate-2 px-2 py-1 rounded-md">
              <h1 className="text-2xl font-serif font-bold text-primary">
                Elegant Ethnic
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0">
            {mainCategories.map((category) => (
              <div
                key={category.name}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(category.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Button
                  variant="ghost"
                  className="font-medium gap-1"
                  data-testid={`button-category-${category.name.toLowerCase()}`}
                >
                  {category.icon}
                  {category.name}
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                </Button>

                {/* Mega Dropdown Menu */}
                <div className="absolute left-0 top-full hidden group-hover:block bg-card border-t border shadow-lg z-50 w-72">
                  <div className="p-4 space-y-2">
                    {category.subcategories.map((sub) => (
                      <Link key={sub.path} href={sub.path}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-sm"
                          data-testid={`link-subcategory-${sub.label.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          <Zap className="h-3 w-3 mr-2" />
                          {sub.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            {/* Search - Desktop */}
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search for sarees, suits..."
                className="w-64 pl-9"
                data-testid="input-search"
              />
            </div>

            {/* Search - Mobile */}
            <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-search-mobile">
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" data-testid="button-wishlist">
              <Heart className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" data-testid="button-account">
              <User className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onCartClick}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-xs"
                  data-testid="badge-cart-count"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 space-y-2 border-t max-h-96 overflow-y-auto">
            {mainCategories.map((category) => (
              <div key={category.name}>
                <Button
                  variant="ghost"
                  className="w-full justify-start font-semibold gap-2"
                  data-testid={`button-category-mobile-${category.name.toLowerCase()}`}
                >
                  {category.icon}
                  {category.name}
                </Button>
                <div className="pl-6 space-y-1">
                  {category.subcategories.map((sub) => (
                    <Link key={sub.path} href={sub.path}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid={`link-subcategory-mobile-${sub.label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {sub.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
