import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroSaree from "@assets/generated_images/hero_banner_saree_model.png";
import heroLehenga from "@assets/generated_images/hero_banner_lehenga_model.png";
import heroSalwar from "@assets/generated_images/hero_banner_salwar_suit.png";
import { Link } from "wouter";

const slides = [
  {
    image: heroSaree,
    title: "Exquisite Silk Sarees",
    subtitle: "Timeless elegance for every occasion",
    cta: "Shop Sarees",
    link: "/products/sarees",
  },
  {
    image: heroLehenga,
    title: "Designer Lehengas",
    subtitle: "Make every celebration unforgettable",
    cta: "Explore Collection",
    link: "/products/lehengas",
  },
  {
    image: heroSalwar,
    title: "Elegant Salwar Suits",
    subtitle: "Contemporary style meets tradition",
    cta: "Discover Now",
    link: "/products/salwar-suits",
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden bg-foreground">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="max-w-2xl">
                <h2 className="text-5xl md:text-7xl font-black uppercase text-white mb-6 tracking-tight">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl text-white/80 mb-8 uppercase font-semibold">
                  {slide.subtitle}
                </p>
                <Link href={slide.link}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white text-foreground border-white font-black uppercase px-8 hover:bg-white/90 text-lg"
                    data-testid={`button-hero-cta-${index}`}
                  >
                    {slide.cta} →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border-white/30"
        onClick={prevSlide}
        data-testid="button-carousel-prev"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border-white/30"
        onClick={nextSlide}
        data-testid="button-carousel-next"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? "w-8 bg-white"
                : "w-2 bg-white/50 hover:bg-white/75"
            }`}
            data-testid={`button-carousel-dot-${index}`}
          />
        ))}
      </div>
    </div>
  );
}
