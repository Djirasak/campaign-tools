"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import styles from "./checkout.module.css";
import type { CartLine, PkgConfig, ShippingMethod, Coupon, OrderResponse, PayloadTab } from "./types";
import { COUPONS, NOT_REQUIRE_USER, DEFAULT_PKG_CONFIG, MOCK_PACKAGES } from "./mock-data";
import { propsEqual, buildInfoSummaryHtml, buildInfoSummaryWithShipHtml, generateFakeContact, generateFakeAddress } from "./utils";
import { highlight } from "../../lib/utils";
import DevBar from "../components/DevBar";
import SiteHeader from "../components/SiteHeader";
import PackagePicker from "./partials/PackagePicker";
import StepsNav from "./partials/StepsNav";
import InformationStep from "./partials/InformationStep";
import ShippingStep from "./partials/ShippingStep";
import PaymentStep from "./partials/PaymentStep";
import OrderSummary from "./partials/OrderSummary";
import PayloadPreview from "./partials/PayloadPreview";

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

  // Order — cartLines are the actual items in the cart (a package can appear
  // more than once as separate lines); configs holds the upsell/properties
  // draft for a package while its picker row is expanded, before it's added.
  const [cartLines, setCartLines] = useState<CartLine[]>([
    { id: 1, package_id: 102, quantity: 1, is_upsell: false, properties: [] },
  ]);
  const nextLineId = useRef(2);
  const [configs, setConfigs] = useState<Record<number, PkgConfig>>({});
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
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
  const [payloadTab, setPayloadTab] = useState<PayloadTab>("request");
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null);

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
  const getConfig = (id: number): PkgConfig => configs[id] ?? DEFAULT_PKG_CONFIG;

  const subtotal = cartLines.reduce((sum, l) => {
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
  const updateConfig = (id: number, updater: (c: PkgConfig) => PkgConfig) => {
    setConfigs((prev) => ({ ...prev, [id]: updater(prev[id] ?? DEFAULT_PKG_CONFIG) }));
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Mirrors campaign-cart's cartStore.addItem: merges on package_id, bumping
  // quantity on the existing line instead of adding a duplicate. Extended so
  // an upsell add never folds into a regular line (or vice versa) — upsells
  // are a distinct purchase decision and should stay their own line. Also
  // extended so lines with different custom properties (e.g. different
  // personalization) never merge — only an exact properties match bumps qty.
  const addToCart = (id: number) => {
    const cfg = getConfig(id);
    setCartLines((prev) => {
      const idx = prev.findIndex(
        (l) => l.package_id === id && l.is_upsell === cfg.is_upsell && propsEqual(l.properties, cfg.properties)
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      const newLine: CartLine = {
        id: nextLineId.current++,
        package_id: id,
        quantity: 1,
        is_upsell: cfg.is_upsell,
        properties: cfg.properties,
      };
      return [...prev, newLine];
    });
  };

  // ── Cart line handlers (used from the Order Summary cart manager) ──
  const removeLine = (lineId: number) => {
    setCartLines((prev) => prev.filter((l) => l.id !== lineId));
  };

  const changeLineQty = (lineId: number, delta: number) => {
    setCartLines((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, quantity: Math.max(1, (l.quantity || 1) + delta) } : l))
    );
  };

  const setLineQty = (lineId: number, val: string) => {
    const n = Math.max(1, parseInt(val) || 1);
    setCartLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, quantity: n } : l)));
  };

  const setPkgUpsell = (id: number, val: boolean) => {
    updateConfig(id, (c) => ({ ...c, is_upsell: val }));
  };

  const addProperty = (id: number) => {
    updateConfig(id, (c) => ({ ...c, properties: [...c.properties, { key: "", value: "" }] }));
  };

  const updateProperty = (id: number, idx: number, field: "key" | "value", val: string) => {
    updateConfig(id, (c) => ({
      ...c,
      properties: c.properties.map((p, i) => (i === idx ? { ...p, [field]: val } : p)),
    }));
  };

  const removeProperty = (id: number, idx: number) => {
    updateConfig(id, (c) => ({ ...c, properties: c.properties.filter((_, i) => i !== idx) }));
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

  // ── Fake data ──
  const autofillContact = () => {
    const data = generateFakeContact();
    setEmail(data.email);
    setFirstName(data.firstName);
    setLastName(data.lastName);
    setPhone(data.phone);
  };

  const autofillAddress = (countryCode?: string) => {
    const data = generateFakeAddress(countryCode);
    setLine1(data.line1);
    setLine2(data.line2);
    setCity(data.city);
    setStateProvince(data.stateProvince);
    setPostcode(data.postcode);
    setCountry(data.country);
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
    setPayloadTab("response");
    setTimeout(() => {
      setIsLoading(false);

      const needsUser = !NOT_REQUIRE_USER.includes(payMethod);
      const missing: string[] = [];
      if (cartLines.length === 0) missing.push("lines");
      if (needsUser && !email.trim()) missing.push("user.email");
      if (!line1.trim()) missing.push("shipping_address.line1");
      if (!city.trim()) missing.push("shipping_address.city");
      if (!postcode.trim()) missing.push("shipping_address.postcode");
      if (!ship) missing.push("shipping_method");
      if (payMethod === "card_token" && !cardToken.trim()) missing.push("payment_detail.card_token");

      if (missing.length) {
        setOrderResponse({
          status: 400,
          body: { message: `Missing required field(s): ${missing.join(", ")}`, ref_id: null },
        });
        return;
      }

      const refId = `ORD${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      setOrderResponse({
        status: 201,
        body: {
          ref_id: refId,
          number: `#${Math.floor(1000 + Math.random() * 9000)}`,
          is_test: true,
          currency,
          payment_method: payMethod,
          user: {
            email,
            first_name: firstName,
            last_name: lastName,
            phone_number: phone || null,
          },
          shipping_address: {
            first_name: firstName,
            last_name: lastName,
            line1,
            line2: line2 || null,
            country,
            state: stateProvince,
            postcode,
            phone_number: phone || null,
          },
          lines: cartLines.map((l) => {
            const p = getPkg(l.package_id);
            const props = l.properties.filter((prop) => prop.key.trim());
            return {
              id: l.id,
              product_id: l.package_id,
              product_title: p?.name ?? null,
              quantity: l.quantity,
              is_upsell: l.is_upsell,
              price_incl_tax: p ? (parseFloat(p.price_total) * l.quantity).toFixed(2) : "0.00",
              properties: Object.fromEntries(props.map((prop) => [prop.key.trim(), prop.value])),
            };
          }),
          shipping_method: ship?.name ?? null,
          shipping_incl_tax: ship?.price ?? "0.00",
          total_discounts: discount.toFixed(2),
          total_incl_tax: total !== null ? total.toFixed(2) : "0.00",
          order_status_url: `https://${domain}/order/status/${refId}/`,
        },
      });
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

    obj.lines = cartLines.map((l) => {
      const line: Record<string, unknown> = { package_id: l.package_id };
      if (l.quantity > 1) line.quantity = l.quantity;
      if (l.is_upsell) line.is_upsell = true;
      const props = l.properties.filter((p) => p.key.trim());
      if (props.length) line.properties = Object.fromEntries(props.map((p) => [p.key.trim(), p.value]));
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
      payMethod === "google_pay" && gpaySuccessUrl ? gpaySuccessUrl : `https://${domain}/order/success/`;
    obj.success_url = successUrl;

    if (coupon) obj.voucher_code = coupon.code;

    return obj;
  }, [payMethod, email, firstName, lastName, phone, cartLines, line1, line2, city, stateProvince, postcode, country, billingSame, ship, cardToken, gpaySuccessUrl, domain, coupon]);

  const highlightedPayload = highlight(JSON.stringify(payload, null, 2));
  const highlightedResponse = orderResponse ? highlight(JSON.stringify(orderResponse.body, null, 2)) : "";

  const copyPayload = () => {
    const text =
      payloadTab === "request"
        ? JSON.stringify(payload, null, 2)
        : orderResponse
        ? JSON.stringify(orderResponse.body, null, 2)
        : "";
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopyLabel("Copied!");
    setTimeout(() => setCopyLabel("Copy JSON"), 1500);
  };

  // ── Info summary HTML ──
  const infoFields = { firstName, lastName, email, line1, city, stateProvince, country };
  const infoSummaryHtml = buildInfoSummaryHtml(infoFields);
  const infoSummaryWithShipHtml = buildInfoSummaryWithShipHtml(infoFields, ship, fmt);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className={styles.checkout}>
      <DevBar
        apiKey={apiKey}
        domain={domain}
        currency={currency}
        onApiKeyChange={setApiKey}
        onDomainChange={setDomain}
        onCurrencyChange={setCurrency}
      />

      <SiteHeader brand="NovaSkin" />

      <div className={styles.mainWrap}>
        {/* ── LEFT ── */}
        <div>
          <PackagePicker
            cartLines={cartLines}
            configs={configs}
            expandedIds={expandedIds}
            onToggleExpand={toggleExpand}
            onSetUpsell={setPkgUpsell}
            onAddProperty={addProperty}
            onUpdateProperty={updateProperty}
            onRemoveProperty={removeProperty}
            onAddToCart={addToCart}
          />

          <StepsNav step={step} completedSteps={completedSteps} onGoToStep={goToStep} />

          {step === 1 && (
            <InformationStep
              email={email}
              onEmailChange={setEmail}
              firstName={firstName}
              onFirstNameChange={setFirstName}
              lastName={lastName}
              onLastNameChange={setLastName}
              phone={phone}
              onPhoneChange={setPhone}
              line1={line1}
              onLine1Change={setLine1}
              line2={line2}
              onLine2Change={setLine2}
              city={city}
              onCityChange={setCity}
              stateProvince={stateProvince}
              onStateProvinceChange={setStateProvince}
              postcode={postcode}
              onPostcodeChange={setPostcode}
              country={country}
              onCountryChange={setCountry}
              onAutofillContact={autofillContact}
              onAutofillAddress={autofillAddress}
              onContinue={() => proceedToStep(2)}
            />
          )}

          {step === 2 && (
            <ShippingStep
              infoSummaryHtml={infoSummaryHtml}
              ship={ship}
              onSelectShip={setShip}
              onEditInfo={() => goToStep(1)}
              onContinue={() => proceedToStep(3)}
              onBack={() => goToStep(1)}
            />
          )}

          {step === 3 && (
            <PaymentStep
              infoSummaryHtml={infoSummaryWithShipHtml}
              onEditInfo={() => goToStep(1)}
              payMethod={payMethod}
              onSelectPayMethod={setPayMethod}
              cardToken={cardToken}
              onCardTokenChange={setCardToken}
              gpaySuccessUrl={gpaySuccessUrl}
              onGpaySuccessUrlChange={setGpaySuccessUrl}
              billingSame={billingSame}
              onBillingSameChange={setBillingSame}
              isLoading={isLoading}
              total={total}
              fmt={fmt}
              onPlaceOrder={handlePlaceOrder}
              onBack={() => goToStep(2)}
            />
          )}
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <aside className={styles.orderSummary}>
          <OrderSummary
            cartLines={cartLines}
            currency={currency}
            fmt={fmt}
            coupon={coupon}
            couponInput={couponInput}
            couponError={couponError}
            onCouponInputChange={setCouponInput}
            onApplyCoupon={applyCoupon}
            onRemoveCoupon={removeCoupon}
            subtotal={subtotal}
            discount={discount}
            shipCost={shipCost}
            total={total}
            onChangeLineQty={changeLineQty}
            onSetLineQty={setLineQty}
            onRemoveLine={removeLine}
          />

          <PayloadPreview
            payloadTab={payloadTab}
            onSelectTab={setPayloadTab}
            isLoading={isLoading}
            orderResponse={orderResponse}
            highlightedPayload={highlightedPayload}
            highlightedResponse={highlightedResponse}
            copyLabel={copyLabel}
            onCopy={copyPayload}
          />
        </aside>
      </div>
    </div>
  );
}
