"use client";

import styles from "./DevBar.module.css";
import { cx } from "../../lib/utils";
import { CAMPAIGN_HOST_PRESETS, type CampaignHostPreset } from "../../lib/campaigns-api";

const HOST_PRESET_CLASS: Record<CampaignHostPreset, string> = {
  production: "hostProduction",
  staging: "hostStaging",
  local: "hostLocal",
  custom: "hostCustom",
};

type Props = {
  apiKey: string;
  campaignHostPreset: CampaignHostPreset;
  customCampaignHost: string;
  currency: string;
  onApiKeyChange: (v: string) => void;
  onCampaignHostPresetChange: (v: CampaignHostPreset) => void;
  onCustomCampaignHostChange: (v: string) => void;
  onCurrencyChange: (v: string) => void;
};

export default function DevBar({
  apiKey,
  campaignHostPreset,
  customCampaignHost,
  currency,
  onApiKeyChange,
  onCampaignHostPresetChange,
  onCustomCampaignHostChange,
  onCurrencyChange,
}: Props) {
  return (
    <div className={styles.devBar}>
      <span className={styles.devBarLabel}>Campaign Host</span>
      <div className={styles.hostToggleGroup}>
        {CAMPAIGN_HOST_PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            className={cx(
              styles.hostToggleBtn,
              styles[HOST_PRESET_CLASS[p.value]],
              campaignHostPreset === p.value && styles.active
            )}
            onClick={() => onCampaignHostPresetChange(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>
      {campaignHostPreset === "custom" && (
        <input
          className={styles.devInput}
          value={customCampaignHost}
          onChange={(e) => onCustomCampaignHostChange(e.target.value)}
          placeholder="yourstoreapp.com"
        />
      )}
      <span className={styles.devBarLabel}>API Key</span>
      <input
        className={styles.devInput}
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        placeholder="pk_live_xxxxxxxxxxxxxxxxxx"
      />
      <div className={styles.devBarSep} />
      <span className={styles.devBarLabel}>Currency</span>
      <input
        className={cx(styles.devInput, styles.devCurrency)}
        value={currency}
        onChange={(e) => onCurrencyChange(e.target.value.toUpperCase())}
        placeholder="USD"
        maxLength={3}
      />
    </div>
  );
}
