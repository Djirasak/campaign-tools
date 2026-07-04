"use client";

import { useState } from "react";
import styles from "../checkout.module.css";
import { cx } from "../../../lib/utils";
import { MOCK_PACKAGES } from "../mock-data";
import type { CartLine, Coupon } from "../types";

// Kept in sync with the .sumLineRemoving transition duration in checkout.module.css —
// the line stays in the DOM playing its exit animation for this long before
// the actual removal (onRemoveLine) fires.
const REMOVE_ANIM_MS = 220;

type Props = {
  cartLines: CartLine[];
  currency: string;
  fmt: (n: number) => string;
  coupon: Coupon | null;
  couponInput: string;
  couponError: boolean;
  onCouponInputChange: (v: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  subtotal: number;
  discount: number;
  shipCost: number | null;
  total: number | null;
  onChangeLineQty: (lineId: number, delta: number) => void;
  onSetLineQty: (lineId: number, val: string) => void;
  onRemoveLine: (lineId: number) => void;
};

export default function OrderSummary({
  cartLines,
  currency,
  fmt,
  coupon,
  couponInput,
  couponError,
  onCouponInputChange,
  onApplyCoupon,
  onRemoveCoupon,
  subtotal,
  discount,
  shipCost,
  total,
  onChangeLineQty,
  onSetLineQty,
  onRemoveLine,
}: Props) {
  const getPkg = (id: number) => MOCK_PACKAGES.find((p) => p.ref_id === id);

  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  const handleRemove = (lineId: number) => {
    setRemovingIds((prev) => new Set(prev).add(lineId));
    setTimeout(() => {
      onRemoveLine(lineId);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(lineId);
        return next;
      });
    }, REMOVE_ANIM_MS);
  };

  return (
    <div className={styles.sumCard}>
      <div className={styles.sumHeader}>
        <div className={styles.sumHeaderLabel}>Order Summary</div>
        <div className={styles.sumLines}>
          {cartLines.length === 0 ? (
            <div className={styles.sumEmpty}>No packages selected</div>
          ) : (
            cartLines.map((l) => {
              const p = getPkg(l.package_id);
              if (!p) return null;
              const lineTotal = parseFloat(p.price_total) * (l.quantity || 1);
              const props = l.properties.filter((prop) => prop.key.trim());
              const removing = removingIds.has(l.id);
              return (
                <div key={l.id} className={cx(styles.sumLineItem, removing && styles.sumLineRemoving)}>
                  <div className={styles.sumLineImg}>{p.emoji}</div>
                  <div className={styles.sumLineInfo}>
                    <div className={styles.sumLineName}>{p.name}</div>
                    <div className={styles.sumLineQty}>
                      {p.qty * (l.quantity || 1)} {p.qty * (l.quantity || 1) === 1 ? "bottle" : "bottles"}
                      {l.is_upsell && <span className={styles.sumLineUpsell}> · upsell</span>}
                    </div>
                    {props.length > 0 && (
                      <div className={styles.sumLineProps}>
                        {props.map((prop, i) => (
                          <span key={i} className={styles.sumLinePropTag}>
                            {prop.key}: {prop.value}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className={styles.sumLineActions}>
                      <div className={styles.sumLineQtyWrap}>
                        <button className={styles.sumLineQtyBtn} onClick={() => onChangeLineQty(l.id, -1)}>
                          −
                        </button>
                        <input
                          className={styles.sumLineQtyVal}
                          type="number"
                          min="1"
                          value={l.quantity}
                          onChange={(e) => onSetLineQty(l.id, e.target.value)}
                        />
                        <button className={styles.sumLineQtyBtn} onClick={() => onChangeLineQty(l.id, +1)}>
                          +
                        </button>
                      </div>
                      <button
                        className={styles.sumLineRemoveBtn}
                        onClick={() => handleRemove(l.id)}
                        disabled={removing}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className={styles.sumLinePrice}>${lineTotal.toFixed(2)}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className={styles.sumBody}>
        {/* Coupon */}
        {!coupon ? (
          <div className={styles.couponRow}>
            <input
              className={cx(styles.couponInput, couponError && styles.couponInputError)}
              type="text"
              value={couponInput}
              onChange={(e) => onCouponInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onApplyCoupon()}
              placeholder="Discount / gift card code"
            />
            <button className={styles.btnCoupon} onClick={onApplyCoupon}>
              Apply
            </button>
          </div>
        ) : (
          <div className={styles.couponApplied}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {coupon.code} applied
            <button className={styles.couponRemove} onClick={onRemoveCoupon}>
              Remove
            </button>
          </div>
        )}

        {/* Line items */}
        <div className={styles.lineItems}>
          <div className={styles.line}>
            <span className={styles.lineLabel}>Subtotal</span>
            <span className={styles.lineVal}>{fmt(subtotal)}</span>
          </div>
          {coupon && (
            <div className={styles.line}>
              <span className={styles.lineLabel}>Discount ({coupon.code})</span>
              <span className={cx(styles.lineVal, styles.lineValDiscount)}>−{fmt(discount)}</span>
            </div>
          )}
          <div className={styles.line}>
            <span className={styles.lineLabel}>Shipping</span>
            {shipCost === null ? (
              <span className={cx(styles.lineVal, styles.lineValPending)}>Select method</span>
            ) : shipCost === 0 ? (
              <span className={cx(styles.lineVal, styles.lineValFree)}>FREE</span>
            ) : (
              <span className={styles.lineVal}>{fmt(shipCost)}</span>
            )}
          </div>
        </div>

        <div className={styles.sumDivider} />
        <div className={styles.totalRow}>
          <span className={styles.totalLbl}>Total</span>
          <span className={styles.totalVal}>
            <span className={styles.totalCurrency}>{currency}</span>
            {total !== null ? fmt(total).replace(/^[^\d]*/, "") : "—"}
          </span>
        </div>
      </div>

      <div className={styles.sumFooter}>
        <div className={styles.trustRow}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          256-bit SSL encryption
        </div>
        <div className={styles.trustRow}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          </svg>
          30-day money back guarantee
        </div>
      </div>
    </div>
  );
}
