import { HeroCarousel } from "@/components/HeroCarousel";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Truck, RefreshCw, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { Link } from "wouter";
import sareeImg from "@assets/generated_images/saree_category_product_photo.png";
import salwarImg from "@assets/generated_images/salwar_suit_category_photo.png";
import kurtiImg from "@assets/generated_images/kurti_category_product_photo.png";
import lehengaImg from "@assets/generated_images/lehenga_category_product_photo.png";
import festiveImg from "@assets/generated_images/festive_promotional_banner.png";
import newArrivalsImg from "@assets/generated_images/new_arrivals_promotional_banner.png";

const categories = [
  { name: "Sarees", image: sareeImg, link: "/products/sarees" },
  { name: "Salwar Suits", image: salwarImg, link: "/products/salwar-suits" },
  { name: "Kurtis", image: kurtiImg, link: "/products/kurtis" },
  { name: "Lehengas", image: lehengaImg, link: "/products/lehengas" },
];

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over ₹2,000",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "30-day return policy",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "100% secure transactions",
  },
  {
    icon: Star,
    title: "Premium Quality",
    description: "Handpicked collections",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    rating: 5,
    comment: "Absolutely stunning sarees! The quality and fabric are exceptional. Highly recommend!",
  },
  {
    name: "Anita Patel",
    rating: 5,
    comment: "Beautiful collection and excellent customer service. My go-to store for ethnic wear.",
  },
  {
    name: "Kavita Singh",
    rating: 5,
    comment: "The lehengas are gorgeous! Perfect for weddings. Fast delivery and great packaging.",
  },
];

export default function Home() {
  const { data: featuredProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <HeroCarousel />

      {/* Features Bar */}
      <div className="border-y bg-card">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col items-center text-center gap-2">
                <feature.icon className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-muted-foreground font-decorative italic">
            Discover our curated collections of traditional ethnic wear
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.name} {...category} />
          ))}
        </div>
      </section>

      {/* Offer Banners */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative rounded-lg overflow-hidden h-64 group cursor-pointer hover-elevate active-elevate-2">
            <img
              src={festiveImg}
              alt="Festive Sale"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="relative rounded-lg overflow-hidden h-64 group cursor-pointer hover-elevate active-elevate-2">
            <img
              src={newArrivalsImg}
              alt="New Arrivals"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Featured Collection
          </h2>
          <p className="text-lg text-muted-foreground font-decorative italic">
            Handpicked pieces for the discerning shopper
          </p>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-96 animate-pulse bg-muted" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/products">
                <Button size="lg" variant="outline" data-testid="button-view-all">
                  View All Products
                </Button>
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Testimonials */}
      <section className="bg-card border-y">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-muted-foreground font-decorative italic">
              Trusted by thousands of happy customers
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">"{testimonial.comment}"</p>
                <p className="font-semibold">— {testimonial.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
