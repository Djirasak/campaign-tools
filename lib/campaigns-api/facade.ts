import { CampaignsGateway, type GatewayConfig } from "./gateway";
import { resolveCampaignHostUrl } from "./config";
import type {
  AddOrderUpsellPayload,
  AddressAutocompleteOptions,
  AddressAutocompleteResponse,
  Campaign,
  CalculateCartOptions,
  CalculateCartPayload,
  Cart,
  CartSummary,
  CreateCartPayload,
  CreateOrderPayload,
  CreateUserPayload,
  Order,
  OrderPaymentRedirect,
  User,
} from "./types";

// Business-facing entry point for campaigns-app's API — mirrors that repo's
// own Facade pattern (campaigns/api/facade.py) but from the consumer side.
// Pages should call this, not CampaignsGateway directly, so endpoint paths
// and other HTTP details stay in one place.
//
// Covers every public (campaign_public_key-authenticated) endpoint on
// campaigns-app as of this writing: campaigns, carts, orders, users, address
// autocomplete, plus the legacy non-DRF analytics/asset endpoints. Internal
// dashboard/OAuth/webhook routes (session-authenticated, not public-key) are
// out of scope — see campaigns-app/campaigns/{stores,offer,logs}/urls.py.
//
// Not wired into any page yet — this is the integration skeleton. Once ready:
//   const campaigns = createCampaignsFacade(apiKey, campaignHost);
//   const campaign = await campaigns.getCampaign(currency);
//   const order = await campaigns.createOrder(payload);
export class CampaignsFacade {
  private readonly gateway: CampaignsGateway;

  constructor(config: GatewayConfig) {
    this.gateway = new CampaignsGateway(config);
  }

  // ── Campaigns ──

  /** GET /api/v1/campaigns/ — campaign details + full catalog (packages, shipping, offers, payment methods). Cached server-side. */
  getCampaign(currency?: string): Promise<Campaign> {
    const query = currency ? `?currency=${encodeURIComponent(currency)}` : "";
    return this.gateway.get<Campaign>(`/api/v1/campaigns/${query}`);
  }

  // ── Carts ──

  /** POST /api/v1/carts/ — create/persist a cart (used to hand off to campaigns-app's own hosted checkout via the returned checkout_url). */
  createCart(payload: CreateCartPayload): Promise<Cart> {
    return this.gateway.post<Cart>("/api/v1/carts/", payload);
  }

  /** POST /api/v1/carts/calculate/ — price a set of lines/shipping/vouchers without persisting anything. Pass `{ upsell: true }` to skip site-wide offers when pricing a post-purchase upsell. */
  calculateCart(payload: CalculateCartPayload, options?: CalculateCartOptions): Promise<CartSummary> {
    const query = options?.upsell ? "?upsell=true" : "";
    return this.gateway.post<CartSummary>(`/api/v1/carts/calculate/${query}`, payload);
  }

  // ── Orders ──

  /** POST /api/v1/orders/ — create an order. Hosted payment gateways return `{ payment_complete_url, ref_id }` instead of the full order — check for that shape before treating the result as an Order. */
  createOrder(payload: CreateOrderPayload): Promise<Order | OrderPaymentRedirect> {
    return this.gateway.post<Order | OrderPaymentRedirect>("/api/v1/orders/", payload);
  }

  /** GET /api/v1/orders/{ref_id}/ — retrieve a previously created order. */
  getOrder(refId: string): Promise<Order> {
    return this.gateway.get<Order>(`/api/v1/orders/${encodeURIComponent(refId)}/`);
  }

  /** POST /api/v1/orders/{ref_id}/upsells/ — add a post-purchase upsell line to an existing order. */
  addOrderUpsell(refId: string, payload: AddOrderUpsellPayload): Promise<Order> {
    return this.gateway.post<Order>(`/api/v1/orders/${encodeURIComponent(refId)}/upsells/`, payload);
  }

  // ── Users ──

  /** POST /api/v1/users/ — create or upsert a customer record ahead of checkout. */
  createUser(payload: CreateUserPayload): Promise<User> {
    return this.gateway.post<User>("/api/v1/users/", payload);
  }

  // ── Addresses ──

  /** GET /api/v1/addresses/autocomplete/ — HERE-API-backed address suggestions for a shipping/billing address field. */
  autocompleteAddress(queryText: string, options?: AddressAutocompleteOptions): Promise<AddressAutocompleteResponse> {
    const params = new URLSearchParams({ query_text: queryText });
    if (options?.country) params.set("country", options.country);
    if (options?.language) params.set("language", options.language);
    return this.gateway.get<AddressAutocompleteResponse>(`/api/v1/addresses/autocomplete/?${params.toString()}`);
  }

  // ── Analytics & assets (legacy plain-Django views, not DRF/api/v1) ──

  /**
   * GET /c/event/ — fires a page_view/cart_create/order_create/upsell_create
   * analytics beacon. Auth is a `key` query param here, not the Authorization
   * header, and there's no JSON body — hence the dedicated gateway method.
   */
  trackEvent(eventType: string, sessionId?: string): Promise<{ ncsid?: string }> {
    const params = new URLSearchParams({ key: this.gateway.publicKey, event: eventType });
    const headers: HeadersInit | undefined = sessionId ? { "X-Next-Campaign-Session-ID": sessionId } : undefined;
    return this.gateway.getUnauthenticated<{ ncsid?: string }>(`/c/event/?${params.toString()}`, headers);
  }

  /** URL for the storefront JS bundle (<script src>) — not a fetch call, just a URL builder. */
  getCampaignScriptUrl(version = "v1"): string {
    return `${this.gateway.baseUrl}/js/${version}/campaign/`;
  }

  /**
   * URL a hosted payment gateway redirects the browser back to after payment.
   * Not something this app fetches — campaigns-app itself 302s the browser
   * from here to success_url/payment_failed_url. Exposed only so callers can
   * build it (e.g. for a payment_detail.language redirect config) without
   * hardcoding the path.
   */
  getPaymentReturnUrl(refId: string): string {
    return `${this.gateway.baseUrl}/orders/payment-return/${encodeURIComponent(refId)}/`;
  }
}

/**
 * `campaignHost` is meant to be fed straight from the checkout demo's DevBar
 * "Campaign Host" field — a bare host like "demo.29next.com" or
 * "localhost:8077" is normalized into a fetchable URL (see
 * resolveCampaignHostUrl). Leave it out to fall back to
 * CAMPAIGNS_API_BASE_URL.
 */
export function createCampaignsFacade(publicKey: string, campaignHost?: string): CampaignsFacade {
  return new CampaignsFacade({ publicKey, baseUrl: resolveCampaignHostUrl(campaignHost) });
}
