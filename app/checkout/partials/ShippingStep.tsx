"use client";

import styles from "../checkout.module.css";
import { cx } from "../../../lib/utils";
import { MOCK_SHIPPING } from "../mock-data";
import type { ShippingMethod } from "../types";

type Props = {
  infoSummaryHtml: string;
  ship: ShippingMethod | null;
  onSelectShip: (s: ShippingMethod) => void;
  onEditInfo: () => void;
  onContinue: () => void;
  onBack: () => void;
};

export default function ShippingStep({ infoSummaryHtml, ship, onSelectShip, onEditInfo, onContinue, onBack }: Props) {
  return (
    <div className={styles.stepPanel}>
      <div className={styles.card}>
        <div className={styles.cardHead}>Shipping Method</div>
        <div className={styles.infoSummary}>
          <div className={styles.infoSumText} dangerouslySetInnerHTML={{ __html: infoSummaryHtml }} />
          <button className={styles.infoSumEdit} onClick={onEditInfo}>
            Edit
          </button>
        </div>
        <div className={styles.shipList}>
          {MOCK_SHIPPING.map((s) => {
            const free = parseFloat(s.price) === 0;
            const sel = ship?.ref_id === s.ref_id;
            return (
              <div key={s.ref_id} className={styles.shipOpt} onClick={() => onSelectShip(s)}>
                <input type="radio" name="ship" readOnly checked={sel} />
                <div className={cx(styles.shipLbl, sel && styles.checked)}>
                  <div className={styles.shipLblLeft}>
                    <div className={cx(styles.shipDot, sel && styles.checked)} />
                    <div>
                      <div className={styles.shipName}>{s.name}</div>
                      <div className={styles.shipEta}>{s.eta}</div>
                    </div>
                  </div>
                  <div className={cx(styles.shipPrice, free && styles.free)}>{free ? "FREE" : `$${s.price}`}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <button className={styles.btnPrimary} onClick={onContinue}>
        Continue to Payment
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
      <button className={styles.btnBack} onClick={onBack}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Return to Information
      </button>
    </div>
  );
}
