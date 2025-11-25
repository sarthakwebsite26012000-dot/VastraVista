import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStoreSettings } from "@/lib/storeSettings";

export function Footer() {
  const settings = getStoreSettings();

  return (
    <footer className="bg-card border-t mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-serif font-bold text-primary">
              {settings.storeName}
            </h3>
            <p className="text-sm text-muted-foreground">
              Your destination for premium traditional Indian wear. Exquisite sarees, elegant suits, and designer ethnic collections.
            </p>
            <div className="flex gap-2">
              {settings.facebookUrl && (
                <Link href={settings.facebookUrl}>
                  <Button variant="ghost" size="icon" data-testid="button-facebook">
                    <Facebook className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              {settings.instagramUrl && (
                <Link href={settings.instagramUrl}>
                  <Button variant="ghost" size="icon" data-testid="button-instagram">
                    <Instagram className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              {settings.twitterUrl && (
                <Link href={settings.twitterUrl}>
                  <Button variant="ghost" size="icon" data-testid="button-twitter">
                    <Twitter className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products/sarees" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sarees
                </Link>
              </li>
              <li>
                <Link href="/products/salwar-suits" className="text-muted-foreground hover:text-foreground transition-colors">
                  Salwar Suits
                </Link>
              </li>
              <li>
                <Link href="/products/kurtis" className="text-muted-foreground hover:text-foreground transition-colors">
                  Kurtis
                </Link>
              </li>
              <li>
                <Link href="/products/lehengas" className="text-muted-foreground hover:text-foreground transition-colors">
                  Lehengas
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Customer Service</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{settings.storePhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{settings.storeEmail}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{settings.city}, {settings.state}, India</span>
              </li>
            </ul>
            <ul className="space-y-2 text-sm">
              <li>
                <button className="text-muted-foreground hover:text-foreground transition-colors text-left">
                  Shipping & Returns
                </button>
              </li>
              <li>
                <button className="text-muted-foreground hover:text-foreground transition-colors text-left">
                  Size Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Newsletter</h4>
            <p className="text-sm text-muted-foreground">
              Subscribe to get special offers and updates
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="flex-1"
                data-testid="input-newsletter"
              />
              <Button data-testid="button-subscribe">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            © 2024 {settings.storeName}. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
}
