// Checkout-specific helpers only. Generic, reusable helpers (cx, highlight)
// live in ../../lib/utils.
import {
  faker,
  fakerEN_US,
  fakerEN_GB,
  fakerEN_CA,
  fakerEN_AU,
  fakerDE,
  fakerFR,
  fakerNL,
  fakerNL_BE,
  fakerDE_CH,
  fakerTH,
  fakerZH_CN,
} from "@faker-js/faker";
import type { LineProperty, ShippingMethod } from "./types";
import { COUNTRIES } from "./mock-data";

// Per-country faker locale, so autofilled addresses actually look native to
// the chosen country instead of always being US-shaped. Singapore has no
// dedicated faker locale, so it falls back to the generic EN_US formatting.
const COUNTRY_FAKERS: Record<string, typeof faker> = {
  US: fakerEN_US,
  GB: fakerEN_GB,
  CA: fakerEN_CA,
  AU: fakerEN_AU,
  DE: fakerDE,
  FR: fakerFR,
  NL: fakerNL,
  BE: fakerNL_BE,
  CH: fakerDE_CH,
  TH: fakerTH,
  CN: fakerZH_CN,
  SG: fakerEN_US,
};

export function propsEqual(a: LineProperty[], b: LineProperty[]): boolean {
  const norm = (arr: LineProperty[]) =>
    arr
      .filter((p) => p.key.trim())
      .map((p) => `${p.key.trim()}=${p.value}`)
      .sort()
      .join("&");
  return norm(a) === norm(b);
}

export type FakeContactData = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type FakeAddressData = {
  line1: string;
  line2: string;
  city: string;
  stateProvince: string;
  postcode: string;
  country: string;
};

export function generateFakeContact(): FakeContactData {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    firstName,
    lastName,
    phone: faker.phone.number(),
  };
}

export function generateFakeAddress(countryCode?: string): FakeAddressData {
  const country = countryCode || faker.helpers.arrayElement(COUNTRIES).value;
  const f = COUNTRY_FAKERS[country] ?? faker;
  return {
    line1: f.location.streetAddress(),
    line2: f.datatype.boolean(0.3) ? f.location.secondaryAddress() : "",
    city: f.location.city(),
    stateProvince: f.location.state ? f.location.state() : "",
    postcode: f.location.zipCode(),
    country,
  };
}

type InfoSummaryFields = {
  firstName: string;
  lastName: string;
  email: string;
  line1: string;
  city: string;
  stateProvince: string;
  country: string;
};

export function buildInfoSummaryHtml(fields: InfoSummaryFields): string {
  const { firstName, lastName, email, line1, city, stateProvince, country } = fields;
  const addr = [line1, city, stateProvince, country].filter(Boolean).join(", ");
  return `<strong>${firstName || "—"} ${lastName}</strong> · ${email || "—"}<br>${addr}`;
}

export function buildInfoSummaryWithShipHtml(
  fields: InfoSummaryFields,
  ship: ShippingMethod | null,
  fmt: (n: number) => string
): string {
  let html = buildInfoSummaryHtml(fields);
  if (ship) {
    const sp = parseFloat(ship.price);
    html += `<br><strong>Shipping:</strong> ${ship.name} · ${sp === 0 ? "FREE" : fmt(sp)}`;
  }
  return html;
}
