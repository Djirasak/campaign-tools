import { CAMPAIGNS_API_BASE_URL } from "./config";
import { CampaignsApiError, type ApiErrorBody } from "./types";

export type GatewayConfig = {
  /** Campaign public key, sent raw in the Authorization header (no "Bearer " prefix). */
  publicKey: string;
  /** Overrides CAMPAIGNS_API_BASE_URL for this instance (e.g. per-campaign custom domain). */
  baseUrl?: string;
};

// Low-level HTTP client for campaigns-app's public API. Knows the transport
// (base URL, auth header, error shape) and nothing about campaign/order
// business logic — that lives in CampaignsFacade, which is what pages should
// actually call. CORS note: campaigns-app allows localhost origins directly
// (campaigns/stores/receivers.py), so this can run straight from the browser
// when campaigns-app is reachable at CAMPAIGNS_API_BASE_URL.
export class CampaignsGateway {
  readonly baseUrl: string;
  readonly publicKey: string;

  constructor(config: GatewayConfig) {
    this.baseUrl = config.baseUrl ?? CAMPAIGNS_API_BASE_URL;
    this.publicKey = config.publicKey;
  }

  private async parse<T>(res: Response): Promise<T> {
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      throw new CampaignsApiError(res.status, body as ApiErrorBody | null);
    }
    return body as T;
  }

  private request<T>(path: string, init?: RequestInit): Promise<T> {
    return fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.publicKey,
        ...init?.headers,
      },
    }).then((res) => this.parse<T>(res));
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" });
  }

  post<T>(path: string, payload: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body: JSON.stringify(payload) });
  }

  // For legacy, non-DRF endpoints (e.g. /c/event/) that live outside
  // /api/v1/ and authenticate via a `key` query param baked into the caller's
  // path rather than the Authorization header.
  getUnauthenticated<T>(path: string, headers?: HeadersInit): Promise<T> {
    return fetch(`${this.baseUrl}${path}`, { method: "GET", headers }).then((res) => this.parse<T>(res));
  }
}
