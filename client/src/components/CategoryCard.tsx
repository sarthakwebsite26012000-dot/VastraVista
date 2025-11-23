import { Link } from "wouter";
import { Card } from "@/components/ui/card";

interface CategoryCardProps {
  name: string;
  image: string;
  link: string;
}

export function CategoryCard({ name, image, link }: CategoryCardProps) {
  return (
    <Link href={link}>
      <Card className="group overflow-hidden cursor-pointer hover-elevate active-elevate-2 h-80" data-testid={`card-category-${name.toLowerCase().replace(/\s+/g, "-")}`}>
        <div className="relative h-full">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-3xl font-serif font-bold text-white">{name}</h3>
          </div>
        </div>
      </Card>
    </Link>
  );
}
