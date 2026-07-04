export { CampaignsGateway, type GatewayConfig } from "./gateway";
export { CampaignsFacade, createCampaignsFacade } from "./facade";
export {
  CAMPAIGNS_API_BASE_URL,
  CAMPAIGN_HOST_PRESETS,
  resolveCampaignHostUrl,
  resolveCampaignHostPreset,
  type CampaignHostPreset,
} from "./config";
export * from "./types";
