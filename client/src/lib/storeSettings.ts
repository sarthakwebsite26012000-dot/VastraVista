export interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  paymentMethods: {
    upi: boolean;
    card: boolean;
    netBanking: boolean;
    cod: boolean;
  };
  shippingFree: string;
  shippingStandard: string;
  heroSlides?: Array<{
    id: string;
    image: string;
    title: string;
    subtitle: string;
    cta: string;
    link: string;
  }>;
  categoryCardImages?: Record<string, string>;
  promotionalBanners?: Array<{
    id: string;
    image: string;
    title: string;
  }>;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Elegant Ethnic",
  storeEmail: "support@elegantethnic.com",
  storePhone: "+91 98765 43210",
  address: "123 Fashion Street",
  city: "Mumbai",
  state: "Maharashtra",
  zipCode: "400001",
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  twitterUrl: "https://twitter.com",
  paymentMethods: {
    upi: true,
    card: true,
    netBanking: true,
    cod: true,
  },
  shippingFree: "2000",
  shippingStandard: "100",
  heroSlides: [
    {
      id: "hero-1",
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&h=600&fit=crop",
      title: "Elegant Sarees",
      subtitle: "Discover timeless beauty",
      cta: "SHOP SAREES",
      link: "/products/sarees",
    },
    {
      id: "hero-2",
      image: "https://images.unsplash.com/photo-1617156955322-b1be3c4b07b5?w=1200&h=600&fit=crop",
      title: "Salwar Suits",
      subtitle: "Comfort meets style",
      cta: "SHOP SUITS",
      link: "/products/salwar-suits",
    },
    {
      id: "hero-3",
      image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=1200&h=600&fit=crop",
      title: "Kurtis & Lehengas",
      subtitle: "Express your elegance",
      cta: "SHOP NOW",
      link: "/products/kurtis",
    },
  ],
  categoryCardImages: {
    sarees: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop",
    "salwar-suits": "https://images.unsplash.com/photo-1617156955322-b1be3c4b07b5?w=400&h=400&fit=crop",
    kurtis: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=400&fit=crop",
    lehengas: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9ca?w=400&h=400&fit=crop",
    "mens-wear": "https://images.unsplash.com/photo-1516762714482-f1d21108ddb3?w=400&h=400&fit=crop",
    "kids-wear": "https://images.unsplash.com/photo-1519571881778-386933cc6b6b?w=400&h=400&fit=crop",
    bags: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
  },
  promotionalBanners: [
    {
      id: "banner-1",
      image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=400&fit=crop",
      title: "SUMMER COLLECTION",
    },
  ],
};

const SETTINGS_KEY = "vistravista_store_settings";

export function getStoreSettings(): StoreSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("Error reading store settings:", error);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoreSettings(settings: StoreSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving store settings:", error);
  }
}
