// Shapes for campaigns-app's public API (campaigns/api/ in that repo).
// `Order` mirrors the real POST /api/v1/orders/ response fields exactly;
// `Campaign` is intentionally loose on nested sections (packages,
// shipping_methods, offers, ...) — refine those once this is actually wired
// up against a running campaigns-app instance.

export type Address = {
  first_name?: string;
  last_name?: string;
  line1: string;
  line2?: string | null;
  line3?: string | null;
  line4?: string | null;
  city?: string;
  state?: string;
  postcode?: string;
  country: string;
  phone_number?: string | null;
  notes?: string | null;
};

export type UserAddressInput = {
  line1: string;
  line4?: string; // city
  country: string;
  phone_number?: string | null;
  is_default_for_shipping?: boolean;
  is_default_for_billing?: boolean;
};

export type UserInput = {
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string | null;
  accepts_marketing?: boolean;
  language?: string;
  addresses?: UserAddressInput[];
};

export type CreateOrderLine = {
  package_id: number;
  quantity?: number;
  is_upsell?: boolean;
  properties?: Record<string, string>;
};

export type PaymentDetail = {
  payment_method: string;
  payment_gateway?: string;
  payment_gateway_group?: string;
  card_token?: string | null;
  external_payment_method?: string;
  language?: string;
  [key: string]: unknown;
};

export type CreateOrderPayload = {
  user?: UserInput;
  lines: CreateOrderLine[];
  use_default_shipping_address?: boolean;
  shipping_address?: Address;
  use_default_billing_address?: boolean;
  billing_same_as_shipping_address?: boolean;
  billing_address?: Address;
  payment_detail: PaymentDetail;
  shipping_method: number | null;
  success_url: string;
  payment_failed_url?: string;
  currency?: string;
  vouchers?: string[];
};

// Hosted-payment gateways return a redirect URL instead of the full order.
export type OrderPaymentRedirect = { payment_complete_url: string; ref_id: string };

export type OrderLine = {
  id: number;
  image: string | null;
  is_upsell: boolean;
  metadata: Record<string, unknown> | null;
  price_excl_tax: string;
  price_excl_tax_excl_discounts: string;
  price_incl_tax: string;
  price_incl_tax_excl_discounts: string;
  product_id: number;
  product_sku: string;
  product_title: string;
  properties: Record<string, string> | unknown[];
  quantity: number;
  variant_id: number | null;
};

export type OrderDiscount = {
  amount: string;
  description: string;
  name: string;
  offer_id: number;
  percentage: string;
};

export type OrderAttribution = {
  affiliate: string | null;
  funnel: string | null;
  gclid: string | null;
  metadata: Record<string, unknown> | null;
  subaffiliate1: string | null;
  subaffiliate2: string | null;
  subaffiliate3: string | null;
  subaffiliate4: string | null;
  subaffiliate5: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_medium: string | null;
  utm_source: string | null;
  utm_term: string | null;
};

export type OrderUser = {
  accepts_marketing: boolean;
  email: string;
  first_name: string;
  ip: string | null;
  language: string | null;
  last_name: string;
  phone_number: string | null;
  user_agent: string | null;
};

// Response shape of POST /api/v1/orders/.
export type Order = {
  attribution: OrderAttribution;
  billing_address: Address;
  currency: string;
  discounts: OrderDiscount[];
  display_taxes: boolean;
  is_test: boolean;
  lines: OrderLine[];
  number: string;
  order_status_url: string;
  payment_method: string;
  ref_id: string;
  shipping_address: Address;
  shipping_code: string;
  shipping_excl_tax: string;
  shipping_incl_tax: string;
  shipping_method: string;
  shipping_tax: string;
  statement_descriptor: string;
  supports_post_purchase_upsells: boolean;
  total_discounts: string;
  total_excl_tax: string;
  total_incl_tax: string;
  total_tax: string;
  user: OrderUser;
};

// ── Carts (POST /api/v1/carts/, POST /api/v1/carts/calculate/) ──

export type CartLineInput = {
  package_id: number;
  quantity?: number;
  is_upsell?: boolean;
  properties?: Record<string, string>;
  metadata?: Record<string, unknown>;
};

export type CreateCartPayload = {
  user?: UserInput;
  lines: CartLineInput[];
  vouchers?: string[];
  attribution?: Record<string, unknown>;
  address?: Address;
  currency?: string;
};

export type CartLine = CartLineInput & {
  price_incl_tax?: string;
  price_excl_tax?: string;
  [key: string]: unknown;
};

export type Cart = {
  user: UserInput | null;
  lines: CartLine[];
  discounts: OrderDiscount[];
  total_incl_tax: string;
  total_excl_tax: string;
  total_incl_tax_excl_discounts?: string;
  total_excl_tax_excl_discounts?: string;
  currency: string;
  checkout_url?: string;
  [key: string]: unknown;
};

export type CalculateCartLineInput = {
  package_id: number;
  quantity?: number;
  is_upsell?: boolean;
};

export type CalculateCartPayload = {
  lines: CalculateCartLineInput[];
  shipping_method?: number;
  vouchers?: string[];
};

export type CalculateCartOptions = {
  /** Skip site-wide offers — used when pricing a post-purchase upsell add-on. */
  upsell?: boolean;
};

export type CartSummaryLine = {
  package_id: number;
  quantity: number;
  original_unit_price?: string;
  discounted_unit_price?: string;
  original_price?: string;
  discounted_price?: string;
  discounts?: OrderDiscount[];
  subtotal?: string;
  total?: string;
  [key: string]: unknown;
};

export type CartSummaryShippingMethod = {
  ref_id: number;
  name?: string;
  price?: string;
  [key: string]: unknown;
};

export type CartSummary = {
  lines: CartSummaryLine[];
  shipping_methods: CartSummaryShippingMethod[];
  total_discounts?: string;
  [key: string]: unknown;
};

// ── Order upsells (POST /api/v1/orders/{ref_id}/upsells/) ──

export type AddUpsellLineInput = {
  package_id: number;
  quantity?: number;
  properties?: Record<string, string>;
  metadata?: Record<string, unknown>;
};

export type AddOrderUpsellPayload = {
  lines: AddUpsellLineInput[];
};

// ── Users (POST /api/v1/users/) ──

export type CreateUserPayload = UserInput;
export type User = UserInput & { [key: string]: unknown };

// ── Address autocomplete (GET /api/v1/addresses/autocomplete/) ──

export type AddressAutocompleteOptions = {
  country?: string;
  language?: string;
};

export type AddressAutocompleteResult = {
  label: string;
  address: {
    line1?: string;
    line3?: string;
    city?: string;
    state?: string;
    state_code?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
};

export type AddressAutocompleteResponse = {
  results: AddressAutocompleteResult[];
};

// Response shape of GET /api/v1/campaigns/. Left loose on nested sections —
// see campaigns-app/.claude/rules/campaigns.md for the real serializer
// hierarchy (PackageSerializer, ShippingOptionSerializer, OfferSerializer, ...).
export type Campaign = {
  currency: string;
  available_currencies: string[];
  packages: unknown[];
  shipping_methods: unknown[];
  offers: unknown[];
  available_payment_methods: unknown[];
  available_payment_methods_express: unknown[];
  available_shipping_countries: unknown[];
  [key: string]: unknown;
};

// campaigns-app's documented error convention: {'message': ..., 'ref_id': ...}
export type ApiErrorBody = {
  message: string;
  ref_id?: string | null;
};

export class CampaignsApiError extends Error {
  status: number;
  body: ApiErrorBody | null;

  constructor(status: number, body: ApiErrorBody | null, message?: string) {
    super(message ?? body?.message ?? `Campaigns API request failed with status ${status}`);
    this.name = "CampaignsApiError";
    this.status = status;
    this.body = body;
  }
}
