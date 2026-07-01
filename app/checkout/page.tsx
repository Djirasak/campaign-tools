"use client";

import { useState, useMemo, useCallback, Fragment } from "react";
import styles from "./checkout.module.css";

// ── Types ──────────────────────────────────────────────────────────────────
type Line = { package_id: number; quantity: number; is_upsell: boolean };
type ShippingMethod = { ref_id: number; name: string; price: string; eta: string };
type PackageMock = {
  ref_id: number;
  name: string;
  qty: number;
  price: string;
  price_total: string;
  emoji: string;
  product_name: string;
  badge: string | null;
  badgeVariant?: "popular" | "best";
  save: string | null;
};
type Coupon = { code: string; type: "pct" | "fixed"; value: number };

// ── Constants ──────────────────────────────────────────────────────────────
const MOCK_PACKAGES: PackageMock[] = [
  { ref_id: 101, name: "Starter Pack", qty: 1, price: "39.00", price_total: "39.00", emoji: "🧴", product_name: "NovaSkin 30-Day System", badge: null, save: null },
  { ref_id: 102, name: "Double Pack", qty: 2, price: "34.50", price_total: "69.00", emoji: "🧴", product_name: "NovaSkin 30-Day System", badge: "Most Popular", badgeVariant: "popular", save: "Save $9" },
  { ref_id: 103, name: "Family Pack", qty: 4, price: "27.25", price_total: "109.00", emoji: "🧴", product_name: "NovaSkin 30-Day System", badge: "Best Value", badgeVariant: "best", save: "Save $47" },
];

const MOCK_SHIPPING: ShippingMethod[] = [
  { ref_id: 201, name: "Standard Shipping", price: "6.95", eta: "5–7 business days" },
  { ref_id: 202, name: "Express Shipping", price: "14.95", eta: "2–3 business days" },
  { ref_id: 203, name: "Free Shipping", price: "0.00", eta: "7–10 business days" },
];

const COUPONS: Record<string, { type: "pct" | "fixed"; value: number }> = {
  SAVE20: { type: "pct", value: 20 },
  FLAT10: { type: "fixed", value: 10 },
};

const PAYMENT_METHODS = [
  { code: "card_token", label: "Card", icon: "💳" },
  { code: "google_pay", label: "Google Pay", icon: "G" },
];

const NOT_REQUIRE_USER = ["apple_pay", "paypal", "google_pay"];

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "NL", label: "Netherlands" },
  { value: "BE", label: "Belgium" },
  { value: "CH", label: "Switzerland" },
  { value: "TH", label: "Thailand" },
  { value: "SG", label: "Singapore" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function cx(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

function highlight(json: string): string {
  return json.replace(
    /("(?:\\.|[^"\\])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (m) => {
      if (/^"/.test(m)) return /:$/.test(m) ? `<span class="k">${m}</span>` : `<span class="s">${m}</span>`;
      if (/true|false/.test(m)) return `<span class="b">${m}</span>`;
      if (/null/.test(m)) return `<span class="nl">${m}</span>`;
      return `<span class="n">${m}</span>`;
    }
  );
}

// ── Component ──────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  // Config
  const [apiKey, setApiKey] = useState("pk_test_demo1234567890");
  const [domain, setDomain] = useState("demo.29next.com");
  const [currency, setCurrency] = useState("USD");

  // Form — contact
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Form — shipping address
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("US");

  // Order
  const [lines, setLines] = useState<Line[]>([{ package_id: 102, quantity: 1, is_upsell: false }]);
  const [ship, setShip] = useState<ShippingMethod | null>(null);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState(false);
  const [payMethod, setPayMethod] = useState("card_token");
  const [cardToken, setCardToken] = useState("");
  const [gpaySuccessUrl, setGpaySuccessUrl] = useState("");
  const [billingSame, setBillingSame] = useState(true);
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy JSON");

  // ── Computed ──
  const fmt = useCallback(
    (n: number) => {
      try {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(n);
      } catch {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
      }
    },
    [currency]
  );

  const getPkg = (id: number) => MOCK_PACKAGES.find((p) => p.ref_id === id);
  const isChecked = (id: number) => lines.some((l) => l.package_id === id);
  const getLine = (id: number) => lines.find((l) => l.package_id === id);

  const subtotal = lines.reduce((sum, l) => {
    const p = getPkg(l.package_id);
    return sum + (p ? parseFloat(p.price_total) * (l.quantity || 1) : 0);
  }, 0);

  const discount = coupon
    ? coupon.type === "pct"
      ? subtotal * (coupon.value / 100)
      : Math.min(coupon.value, subtotal)
    : 0;

  const shipCost = ship ? parseFloat(ship.price) : null;
  const total = shipCost !== null ? Math.max(0, subtotal - discount + shipCost) : null;

  // ── Package handlers ──
  const togglePkg = (id: number) => {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.package_id === id);
      if (idx >= 0) return prev.filter((l) => l.package_id !== id);
      return [...prev, { package_id: id, quantity: 1, is_upsell: false }];
    });
  };

  const changePkgQty = (id: number, delta: number) => {
    setLines((prev) =>
      prev.map((l) =>
        l.package_id === id ? { ...l, quantity: Math.max(1, (l.quantity || 1) + delta) } : l
      )
    );
  };

  const setPkgQty = (id: number, val: string) => {
    const n = Math.max(1, parseInt(val) || 1);
    setLines((prev) => prev.map((l) => (l.package_id === id ? { ...l, quantity: n } : l)));
  };

  const setPkgUpsell = (id: number, val: boolean) => {
    setLines((prev) => prev.map((l) => (l.package_id === id ? { ...l, is_upsell: val } : l)));
  };

  // ── Coupon ──
  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    const c = COUPONS[code];
    if (c) {
      setCoupon({ code, ...c });
      setCouponError(false);
    } else if (code) {
      setCouponError(true);
      setTimeout(() => setCouponError(false), 1500);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput("");
  };

  // ── Steps ──
  const proceedToStep = (n: number) => {
    setCompletedSteps((prev) => new Set(Array.from(prev).concat(n - 1)));
    setStep(n);
  };

  const goToStep = (n: number) => {
    if (n > step && !completedSteps.has(n - 1)) return;
    setStep(n);
  };

  const handlePlaceOrder = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("✅ (mock) Order created!\n\nSee the JSON payload in the sidebar →");
    }, 1800);
  };

  // ── Payload ──
  const payload = useMemo(() => {
    const needsUser = !NOT_REQUIRE_USER.includes(payMethod);
    const obj: Record<string, unknown> = {};

    if (needsUser) {
      obj.user = {
        email,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
      };
    }

    obj.lines = lines.map((l) => {
      const line: Record<string, unknown> = { package_id: l.package_id };
      if (l.quantity > 1) line.quantity = l.quantity;
      if (l.is_upsell) line.is_upsell = true;
      return line;
    });

    obj.shipping_address = {
      line1,
      line2: line2 || null,
      city,
      state: stateProvince,
      postcode,
      country,
    };
    obj.billing_same_as_shipping_address = billingSame;
    obj.shipping_method = ship?.ref_id ?? null;

    const detail: Record<string, unknown> = { payment_method: payMethod };
    if (payMethod === "card_token") detail.card_token = cardToken || null;
    obj.payment_detail = detail;

    const successUrl =
      payMethod === "google_pay" && gpaySuccessUrl
        ? gpaySuccessUrl
        : `https://${domain}/order/success/`;
    obj.success_url = successUrl;

    if (coupon) obj.voucher_code = coupon.code;

    return obj;
  }, [payMethod, email, firstName, lastName, phone, lines, line1, line2, city, stateProvince, postcode, country, billingSame, ship, cardToken, gpaySuccessUrl, domain, coupon]);

  const highlightedPayload = highlight(JSON.stringify(payload, null, 2));

  const copyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy JSON"), 1500);
  };

  // ── Info summary HTML ──
  const infoSummaryHtml = () => {
    const addr = [line1, city, stateProvince, country].filter(Boolean).join(", ");
    return `<strong>${firstName || "—"} ${lastName}</strong> · ${email || "—"}<br>${addr}`;
  };

  const infoSummaryWithShipHtml = () => {
    let html = infoSummaryHtml();
    if (ship) {
      const sp = parseFloat(ship.price);
      html += `<br><strong>Shipping:</strong> ${ship.name} · ${sp === 0 ? "FREE" : fmt(sp)}`;
    }
    return html;
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className={styles.checkout}>
      {/* Dev Bar */}
      <div className={styles.devBar}>
        <span className={styles.devBarLabel}>API Key</span>
        <input
          className={styles.devInput}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="pk_live_xxxxxxxxxxxxxxxxxx"
        />
        <span className={cx(styles.devTag, styles.devTagTest)}>TEST</span>
        <div className={styles.devBarSep} />
        <span className={styles.devBarLabel}>Domain</span>
        <input
          className={styles.devInput}
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="yourstoreapp.com"
        />
        <div className={styles.devBarSep} />
        <span className={styles.devBarLabel}>Currency</span>
        <input
          className={cx(styles.devInput, styles.devCurrency)}
          value={currency}
          onChange={(e) => setCurrency(e.target.value.toUpperCase())}
          placeholder="USD"
          maxLength={3}
        />
      </div>

      {/* Header */}
      <header className={styles.siteHeader}>
        <a href="#" className={styles.brand}>NovaSkin</a>
        <div className={styles.secureBadge}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Secure Checkout
        </div>
      </header>

      <div className={styles.mainWrap}>
        {/* ── LEFT ── */}
        <div>
          {/* Package Picker */}
          <div className={styles.sectionEyebrow}>Select your package</div>
          <div className={styles.card}>
            <div className={styles.cardHead}>Choose a Package</div>
            <div className={styles.pkgList}>
              {MOCK_PACKAGES.map((p) => {
                const checked = isChecked(p.ref_id);
                const line = getLine(p.ref_id);
                return (
                  <div key={p.ref_id} className={styles.pkgOpt}>
                    <input
                      type="checkbox"
                      className={styles.pkgCheck}
                      id={`pkg${p.ref_id}`}
                      checked={checked}
                      onChange={() => togglePkg(p.ref_id)}
                    />
                    <div className={cx(styles.pkgCard, checked && styles.checked)}>
                      <label
                        className={cx(styles.pkgLbl, checked && styles.checked)}
                        htmlFor={`pkg${p.ref_id}`}
                      >
                        <div className={cx(styles.pkgCheckBox, checked && styles.checked)}>
                          <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3.5">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </div>
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
                      </label>
                      <div className={cx(styles.pkgControls, checked && styles.visible)}>
                        <span className={styles.qtyLabel}>Qty</span>
                        <div className={styles.qtyWrap}>
                          <button className={styles.qtyBtn} onClick={() => changePkgQty(p.ref_id, -1)}>−</button>
                          <input
                            className={styles.qtyVal}
                            type="number"
                            min="1"
                            value={line?.quantity ?? 1}
                            onChange={(e) => setPkgQty(p.ref_id, e.target.value)}
                          />
                          <button className={styles.qtyBtn} onClick={() => changePkgQty(p.ref_id, +1)}>+</button>
                        </div>
                        <label className={styles.upsellToggle} title="is_upsell">
                          <input
                            type="checkbox"
                            checked={line?.is_upsell ?? false}
                            onChange={(e) => setPkgUpsell(p.ref_id, e.target.checked)}
                          />
                          <span className={cx(styles.upsellPill, (line?.is_upsell ?? false) && styles.active)}>
                            Upsell
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Steps Nav */}
          <div className={styles.stepsBar}>
            {([1, 2, 3] as const).map((s, i) => {
              const isDone = completedSteps.has(s) && step !== s;
              const isActive = step === s;
              return (
                <Fragment key={s}>
                  <button
                    className={cx(styles.stepBtn, isActive && styles.active, isDone && styles.done)}
                    onClick={() => goToStep(s)}
                  >
                    <span className={cx(styles.stepNum, isActive && styles.active, isDone && styles.done)}>
                      {isDone ? (
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : s}
                    </span>
                    <span className={styles.stepLabel}>
                      {["Information", "Shipping", "Payment"][s - 1]}
                    </span>
                  </button>
                  {i < 2 && <div className={styles.stepArrow} />}
                </Fragment>
              );
            })}
          </div>

          {/* ── STEP 1: Information ── */}
          {step === 1 && (
            <div className={styles.stepPanel}>
              <div className={styles.card}>
                <div className={styles.cardHead}>Contact Information</div>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Email</label>
                    <input
                      className={styles.fieldInput}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      onChange={(e) => setFirstName(e.target.value)}
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
                      onChange={(e) => setLastName(e.target.value)}
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
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555 000 0000"
                      autoComplete="tel"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>Shipping Address</div>
                <div className={styles.fieldRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Address Line 1</label>
                    <input
                      className={styles.fieldInput}
                      type="text"
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
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
                      onChange={(e) => setLine2(e.target.value)}
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
                      onChange={(e) => setCity(e.target.value)}
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
                      onChange={(e) => setStateProvince(e.target.value)}
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
                      onChange={(e) => setPostcode(e.target.value)}
                      placeholder="10001"
                      autoComplete="postal-code"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Country</label>
                    <select
                      className={styles.fieldSelect}
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      autoComplete="country"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button className={styles.btnPrimary} onClick={() => proceedToStep(2)}>
                Continue to Shipping
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* ── STEP 2: Shipping ── */}
          {step === 2 && (
            <div className={styles.stepPanel}>
              <div className={styles.card}>
                <div className={styles.cardHead}>Shipping Method</div>
                <div className={styles.infoSummary}>
                  <div
                    className={styles.infoSumText}
                    dangerouslySetInnerHTML={{ __html: infoSummaryHtml() }}
                  />
                  <button className={styles.infoSumEdit} onClick={() => goToStep(1)}>Edit</button>
                </div>
                <div className={styles.shipList}>
                  {MOCK_SHIPPING.map((s) => {
                    const free = parseFloat(s.price) === 0;
                    const sel = ship?.ref_id === s.ref_id;
                    return (
                      <div key={s.ref_id} className={styles.shipOpt} onClick={() => setShip(s)}>
                        <input type="radio" name="ship" readOnly checked={sel} />
                        <div className={cx(styles.shipLbl, sel && styles.checked)}>
                          <div className={styles.shipLblLeft}>
                            <div className={cx(styles.shipDot, sel && styles.checked)} />
                            <div>
                              <div className={styles.shipName}>{s.name}</div>
                              <div className={styles.shipEta}>{s.eta}</div>
                            </div>
                          </div>
                          <div className={cx(styles.shipPrice, free && styles.free)}>
                            {free ? "FREE" : `$${s.price}`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button className={styles.btnPrimary} onClick={() => proceedToStep(3)}>
                Continue to Payment
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button className={styles.btnBack} onClick={() => goToStep(1)}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Return to Information
              </button>
            </div>
          )}

          {/* ── STEP 3: Payment ── */}
          {step === 3 && (
            <div className={styles.stepPanel}>
              <div className={styles.card}>
                <div className={styles.cardHead}>Payment</div>
                <div className={styles.infoSummary}>
                  <div
                    className={styles.infoSumText}
                    dangerouslySetInnerHTML={{ __html: infoSummaryWithShipHtml() }}
                  />
                  <button className={styles.infoSumEdit} onClick={() => goToStep(1)}>Edit</button>
                </div>

                {/* Method tabs */}
                <div className={styles.pmGrid}>
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.code}
                      className={cx(styles.pmMethod, payMethod === m.code && styles.active)}
                      onClick={() => setPayMethod(m.code)}
                      title={m.code}
                    >
                      <span className={styles.pmMethodIcon}>{m.icon}</span>
                      <span>{m.label}</span>
                      <span className={styles.pmMethodCode}>{m.code}</span>
                    </button>
                  ))}
                </div>

                {/* card_token panel */}
                {payMethod === "card_token" && (
                  <div>
                    <div className={styles.fieldRow}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Card Token <span className={styles.fieldTag}>card_token</span>
                        </label>
                        <input
                          className={cx(styles.fieldInput, styles.fieldInputMono)}
                          type="text"
                          value={cardToken}
                          onChange={(e) => setCardToken(e.target.value)}
                          placeholder="tok_visa_xxxxxxxxxxxx"
                        />
                        <span className={styles.fieldHint}>Token generated by your payment provider (Stripe, etc.)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* google_pay panel */}
                {payMethod === "google_pay" && (
                  <div>
                    <div className={styles.fieldRow}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>
                          Success URL <span className={styles.fieldTag}>success_url</span>
                        </label>
                        <input
                          className={styles.fieldInput}
                          type="text"
                          value={gpaySuccessUrl}
                          onChange={(e) => setGpaySuccessUrl(e.target.value)}
                          placeholder="https://yourdomain.com/order/success/"
                        />
                        <span className={styles.fieldHint}>Redirect URL after Google Pay authorization completes.</span>
                      </div>
                    </div>
                    <div className={styles.notReqNote}>
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <code>google_pay</code> is in <code>NOT_REQUIRE_USER_PAYMENT_METHODS</code> — <code>user</code> field is optional
                    </div>
                  </div>
                )}

                {/* Billing */}
                <div className={styles.billingSection}>
                  <div className={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      id="billingSame"
                      checked={billingSame}
                      onChange={(e) => setBillingSame(e.target.checked)}
                    />
                    <label className={styles.checkboxLabel} htmlFor="billingSame">
                      Billing address same as shipping{" "}
                      <span className={styles.fieldTag}>billing_same_as_shipping_address</span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                className={styles.btnPrimary}
                disabled={isLoading}
                onClick={handlePlaceOrder}
              >
                {isLoading ? (
                  <>
                    <svg
                      className={styles.spinIcon}
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Place Order — {total !== null ? fmt(total) : "..."}
                  </>
                )}
              </button>
              <p className={styles.termsNote}>
                By placing your order you agree to our{" "}
                <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
              </p>
              <button className={styles.btnBack} onClick={() => goToStep(2)}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Return to Shipping
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <aside className={styles.orderSummary}>
          <div className={styles.sumCard}>
            <div className={styles.sumHeader}>
              <div className={styles.sumHeaderLabel}>Order Summary</div>
              <div className={styles.sumLines}>
                {lines.length === 0 ? (
                  <div className={styles.sumEmpty}>No packages selected</div>
                ) : (
                  lines.map((l) => {
                    const p = getPkg(l.package_id);
                    if (!p) return null;
                    const lineTotal = parseFloat(p.price_total) * (l.quantity || 1);
                    return (
                      <div key={l.package_id} className={styles.sumLineItem}>
                        <div className={styles.sumLineImg}>{p.emoji}</div>
                        <div className={styles.sumLineInfo}>
                          <div className={styles.sumLineName}>{p.name}</div>
                          <div className={styles.sumLineQty}>
                            {p.qty * (l.quantity || 1)}{" "}
                            {p.qty * (l.quantity || 1) === 1 ? "bottle" : "bottles"}
                            {l.is_upsell && (
                              <span className={styles.sumLineUpsell}> · upsell</span>
                            )}
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
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    placeholder="Discount / gift card code"
                  />
                  <button className={styles.btnCoupon} onClick={applyCoupon}>Apply</button>
                </div>
              ) : (
                <div className={styles.couponApplied}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {coupon.code} applied
                  <button className={styles.couponRemove} onClick={removeCoupon}>Remove</button>
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

          {/* Payload Preview */}
          <div className={styles.payloadCard}>
            <div className={styles.payloadHead}>
              <span className={styles.payloadTitle}>POST /api/v1/orders/create/</span>
              <button className={styles.payloadCopy} onClick={copyPayload}>{copyLabel}</button>
            </div>
            <pre
              className={styles.payloadPre}
              dangerouslySetInnerHTML={{ __html: highlightedPayload }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
