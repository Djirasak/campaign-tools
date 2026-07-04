"use client";

import styles from "./DevBar.module.css";
import { cx } from "../../lib/utils";

type Props = {
  apiKey: string;
  domain: string;
  currency: string;
  onApiKeyChange: (v: string) => void;
  onDomainChange: (v: string) => void;
  onCurrencyChange: (v: string) => void;
};

export default function DevBar({ apiKey, domain, currency, onApiKeyChange, onDomainChange, onCurrencyChange }: Props) {
  return (
    <div className={styles.devBar}>
      <span className={styles.devBarLabel}>API Key</span>
      <input
        className={styles.devInput}
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        placeholder="pk_live_xxxxxxxxxxxxxxxxxx"
      />
      <span className={cx(styles.devTag, styles.devTagTest)}>TEST</span>
      <div className={styles.devBarSep} />
      <span className={styles.devBarLabel}>Domain</span>
      <input
        className={styles.devInput}
        value={domain}
        onChange={(e) => onDomainChange(e.target.value)}
        placeholder="yourstoreapp.com"
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
