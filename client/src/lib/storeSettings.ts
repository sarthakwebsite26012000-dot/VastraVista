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
