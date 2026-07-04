// Base URL for campaigns-app's public API. Override per environment via
// NEXT_PUBLIC_CAMPAIGNS_API_URL (must be NEXT_PUBLIC_ since the gateway is
// called from the browser). Defaults to campaigns-app's local dev server —
// see campaigns-app/local.yml, which maps it to port 8077.
export const CAMPAIGNS_API_BASE_URL = process.env.NEXT_PUBLIC_CAMPAIGNS_API_URL || "http://localhost:8077";

/**
 * Turns whatever a user typed into the checkout demo's "Campaign Host" field
 * (e.g. "demo.29next.com", "localhost:8077", or a full "https://..." URL)
 * into a fetchable base URL for CampaignsGateway. Empty input falls back to
 * CAMPAIGNS_API_BASE_URL. This is the intended way to plug the DevBar's host
 * field into createCampaignsFacade(publicKey, campaignHost).
 */
export function resolveCampaignHostUrl(campaignHost: string | undefined | null): string {
  const trimmed = (campaignHost ?? "").trim().replace(/\/+$/, "");
  if (!trimmed) return CAMPAIGNS_API_BASE_URL;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(trimmed);
  return `${isLocal ? "http" : "https"}://${trimmed}`;
}

export type CampaignHostPreset = "production" | "staging" | "local" | "custom";

export const CAMPAIGN_HOST_PRESETS: { value: CampaignHostPreset; label: string; url: string | null }[] = [
  { value: "production", label: "Production", url: "https://campaigns.apps.29next.com" },
  { value: "staging", label: "Staging", url: "https://campaigns.apps-staging.29next.com" },
  { value: "local", label: "Local", url: "http://localhost:8077" },
  { value: "custom", label: "Custom…", url: null },
];

/** Resolves a DevBar preset selection (+ custom host, when preset is "custom") into a fetchable base URL. */
export function resolveCampaignHostPreset(preset: CampaignHostPreset, customHost?: string): string {
  const found = CAMPAIGN_HOST_PRESETS.find((p) => p.value === preset);
  if (found?.url) return found.url;
  return resolveCampaignHostUrl(customHost);
}
