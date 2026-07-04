"use client";

import { useState } from "react";
import styles from "../checkout.module.css";
import { cx } from "../../../lib/utils";
import { COUNTRIES } from "../mock-data";

type Props = {
  email: string;
  onEmailChange: (v: string) => void;
  firstName: string;
  onFirstNameChange: (v: string) => void;
  lastName: string;
  onLastNameChange: (v: string) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  line1: string;
  onLine1Change: (v: string) => void;
  line2: string;
  onLine2Change: (v: string) => void;
  city: string;
  onCityChange: (v: string) => void;
  stateProvince: string;
  onStateProvinceChange: (v: string) => void;
  postcode: string;
  onPostcodeChange: (v: string) => void;
  country: string;
  onCountryChange: (v: string) => void;
  onAutofillContact: () => void;
  onAutofillAddress: (countryCode?: string) => void;
  onContinue: () => void;
};

export default function InformationStep({
  email,
  onEmailChange,
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  phone,
  onPhoneChange,
  line1,
  onLine1Change,
  line2,
  onLine2Change,
  city,
  onCityChange,
  stateProvince,
  onStateProvinceChange,
  postcode,
  onPostcodeChange,
  country,
  onCountryChange,
  onAutofillContact,
  onAutofillAddress,
  onContinue,
}: Props) {
  const [autofillCountry, setAutofillCountry] = useState("");

  return (
    <div className={styles.stepPanel}>
      <div className={styles.card}>
        <div className={styles.cardHead}>
          Contact Information
          <button className={styles.autofillBtn} onClick={onAutofillContact} type="button">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" />
            </svg>
            Autofill
          </button>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Email</label>
            <input
              className={styles.fieldInput}
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </div>
        <div className={cx(styles.fieldRow, styles.fieldRowCols2)}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>First Name</label>
            <input
              className={styles.fieldInput}
              type="text"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              placeholder="Jane"
              autoComplete="given-name"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Last Name</label>
            <input
              className={styles.fieldInput}
              type="text"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              placeholder="Smith"
              autoComplete="family-name"
            />
          </div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Phone <span className={cx(styles.fieldTag, styles.fieldTagOptional)}>optional</span>
            </label>
            <input
              className={styles.fieldInput}
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="+1 555 000 0000"
              autoComplete="tel"
            />
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          Shipping Address
          <div className={styles.cardHeadActions}>
            <select
              className={styles.autofillCountrySelect}
              value={autofillCountry}
              onChange={(e) => setAutofillCountry(e.target.value)}
              title="Country to generate the fake address for"
            >
              <option value="">🎲 Random</option>
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <button
              className={styles.autofillBtn}
              onClick={() => onAutofillAddress(autofillCountry || undefined)}
              type="button"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" />
              </svg>
              Autofill
            </button>
          </div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Address Line 1</label>
            <input
              className={styles.fieldInput}
              type="text"
              value={line1}
              onChange={(e) => onLine1Change(e.target.value)}
              placeholder="123 Main Street"
              autoComplete="address-line1"
            />
          </div>
        </div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Address Line 2 <span className={cx(styles.fieldTag, styles.fieldTagOptional)}>optional</span>
            </label>
            <input
              className={styles.fieldInput}
              type="text"
              value={line2}
              onChange={(e) => onLine2Change(e.target.value)}
              placeholder="Apartment, suite, etc."
              autoComplete="address-line2"
            />
          </div>
        </div>
        <div className={cx(styles.fieldRow, styles.fieldRowCols2)}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>City</label>
            <input
              className={styles.fieldInput}
              type="text"
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="New York"
              autoComplete="address-level2"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>State / Province</label>
            <input
              className={styles.fieldInput}
              type="text"
              value={stateProvince}
              onChange={(e) => onStateProvinceChange(e.target.value)}
              placeholder="NY"
              autoComplete="address-level1"
            />
          </div>
        </div>
        <div className={cx(styles.fieldRow, styles.fieldRowCols2)}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Postcode / ZIP</label>
            <input
              className={styles.fieldInput}
              type="text"
              value={postcode}
              onChange={(e) => onPostcodeChange(e.target.value)}
              placeholder="10001"
              autoComplete="postal-code"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Country</label>
            <select
              className={styles.fieldSelect}
              value={country}
              onChange={(e) => onCountryChange(e.target.value)}
              autoComplete="country"
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button className={styles.btnPrimary} onClick={onContinue}>
        Continue to Shipping
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
