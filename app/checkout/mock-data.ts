import type { PackageMock, ShippingMethod, PkgConfig } from "./types";

export const DEFAULT_PKG_CONFIG: PkgConfig = { is_upsell: false, properties: [] };

export const MOCK_PACKAGES: PackageMock[] = [
  { ref_id: 101, name: "Starter Pack", qty: 1, price: "39.00", price_total: "39.00", emoji: "🧴", product_name: "NovaSkin 30-Day System", badge: null, save: null },
  { ref_id: 102, name: "Double Pack", qty: 2, price: "34.50", price_total: "69.00", emoji: "🧴", product_name: "NovaSkin 30-Day System", badge: "Most Popular", badgeVariant: "popular", save: "Save $9" },
  { ref_id: 103, name: "Family Pack", qty: 4, price: "27.25", price_total: "109.00", emoji: "🧴", product_name: "NovaSkin 30-Day System", badge: "Best Value", badgeVariant: "best", save: "Save $47" },
];

export const MOCK_SHIPPING: ShippingMethod[] = [
  { ref_id: 201, name: "Standard Shipping", price: "6.95", eta: "5–7 business days" },
  { ref_id: 202, name: "Express Shipping", price: "14.95", eta: "2–3 business days" },
  { ref_id: 203, name: "Free Shipping", price: "0.00", eta: "7–10 business days" },
];

export const COUPONS: Record<string, { type: "pct" | "fixed"; value: number }> = {
  SAVE20: { type: "pct", value: 20 },
  FLAT10: { type: "fixed", value: 10 },
};

export const PAYMENT_METHODS = [
  { code: "card_token", label: "Card", icon: "💳" },
  { code: "google_pay", label: "Google Pay", icon: "G" },
];

export const NOT_REQUIRE_USER = ["apple_pay", "paypal", "google_pay"];

export const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "NL", label: "Netherlands" },
  { value: "BE", label: "Belgium" },
  { value: "CH", label: "Switzerland" },
  { value: "TH", label: "Thailand" },
  { value: "SG", label: "Singapore" },
  { value: "CN", label: "China" },
];

export const STATUS_TEXT: Record<number, string> = {
  200: "OK",
  201: "Created",
  400: "Bad Request",
  401: "Unauthorized",
  404: "Not Found",
  422: "Unprocessable Entity",
  500: "Internal Server Error",
};
