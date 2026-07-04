export type LineProperty = { key: string; value: string };

// A CartLine has its own id (distinct from package_id) so the same package can
// be added to the cart more than once as separate lines.
export type CartLine = {
  id: number;
  package_id: number;
  quantity: number;
  is_upsell: boolean;
  properties: LineProperty[];
};

export type PkgConfig = { is_upsell: boolean; properties: LineProperty[] };

export type ShippingMethod = { ref_id: number; name: string; price: string; eta: string };

export type PackageMock = {
  ref_id: number;
  name: string;
  qty: number;
  price: string;
  price_total: string;
  emoji: string;
  product_name: string;
  badge: string | null;
  badgeVariant?: "popular" | "best";
  save: string | null;
};

export type Coupon = { code: string; type: "pct" | "fixed"; value: number };

export type OrderResponse = { status: number; body: Record<string, unknown> };

export type PayloadTab = "request" | "response";
