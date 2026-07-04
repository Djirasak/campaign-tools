"use client";

import styles from "../checkout.module.css";
import { cx } from "../../../lib/utils";
import { MOCK_PACKAGES, DEFAULT_PKG_CONFIG } from "../mock-data";
import type { PkgConfig } from "../types";

type Props = {
  configs: Record<number, PkgConfig>;
  expandedId: number | null;
  onToggleExpand: (id: number) => void;
  onSetUpsell: (id: number, val: boolean) => void;
  onAddProperty: (id: number) => void;
  onUpdateProperty: (id: number, idx: number, field: "key" | "value", val: string) => void;
  onRemoveProperty: (id: number, idx: number) => void;
  onAddToCart: (id: number) => void;
};

export default function PackagePicker({
  configs,
  expandedId,
  onToggleExpand,
  onSetUpsell,
  onAddProperty,
  onUpdateProperty,
  onRemoveProperty,
  onAddToCart,
}: Props) {
  const getConfig = (id: number): PkgConfig => configs[id] ?? DEFAULT_PKG_CONFIG;

  return (
    <>
      <div className={styles.sectionEyebrow}>Select your package</div>
      <div className={styles.card}>
        <div className={styles.cardHead}>Choose a Package</div>
        <div className={styles.pkgList}>
          {MOCK_PACKAGES.map((p) => {
            const isOpen = expandedId === p.ref_id;
            const cfg = getConfig(p.ref_id);
            return (
              <div key={p.ref_id} className={styles.pkgOpt}>
                <div className={styles.pkgCard}>
                  <div className={styles.pkgLbl} onClick={() => onToggleExpand(p.ref_id)}>
                    <div className={styles.pkgImg}>{p.emoji}</div>
                    <div className={styles.pkgBody}>
                      <div className={styles.pkgName}>
                        {p.name}
                        {p.badge && (
                          <span className={cx(styles.pkgBadge, p.badgeVariant === "best" && styles.pkgBadgeNew)}>
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <div className={styles.pkgDesc}>
                        {p.qty} {p.qty === 1 ? "bottle" : "bottles"} · {p.product_name}
                      </div>
                      {p.save && <div className={styles.pkgSave}>{p.save}</div>}
                    </div>
                    <div className={styles.pkgPricing}>
                      <div className={styles.pkgPrice}>${p.price_total}</div>
                      <div className={styles.pkgPricePer}>${p.price}/ea</div>
                    </div>
                  </div>
                  <div className={cx(styles.pkgControls, isOpen && styles.visible)}>
                    <div className={styles.pkgControlsRow}>
                      <label className={styles.upsellToggle} title="is_upsell">
                        <input
                          type="checkbox"
                          checked={cfg.is_upsell}
                          onChange={(e) => onSetUpsell(p.ref_id, e.target.checked)}
                        />
                        <span className={cx(styles.upsellPill, cfg.is_upsell && styles.active)}>Upsell</span>
                      </label>
                    </div>
                    <div className={styles.pkgProperties}>
                      {cfg.properties.map((prop, idx) => (
                        <div key={idx} className={styles.propRow}>
                          <input
                            className={styles.propKeyInput}
                            type="text"
                            placeholder="Property name"
                            value={prop.key}
                            onChange={(e) => onUpdateProperty(p.ref_id, idx, "key", e.target.value)}
                          />
                          <input
                            className={styles.propValInput}
                            type="text"
                            placeholder="Value"
                            value={prop.value}
                            onChange={(e) => onUpdateProperty(p.ref_id, idx, "value", e.target.value)}
                          />
                          <button
                            className={styles.propRemoveBtn}
                            title="Remove property"
                            onClick={() => onRemoveProperty(p.ref_id, idx)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button className={styles.addPropBtn} onClick={() => onAddProperty(p.ref_id)}>
                        + Add property
                      </button>
                    </div>
                    <button className={styles.addToCartBtn} onClick={() => onAddToCart(p.ref_id)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
