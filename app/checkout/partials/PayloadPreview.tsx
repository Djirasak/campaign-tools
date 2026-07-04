"use client";

import styles from "../checkout.module.css";
import { cx } from "../../../lib/utils";
import { STATUS_TEXT } from "../mock-data";
import type { OrderResponse, PayloadTab } from "../types";
import Spinner from "../../components/Spinner";

type Props = {
  payloadTab: PayloadTab;
  onSelectTab: (tab: PayloadTab) => void;
  isLoading: boolean;
  orderResponse: OrderResponse | null;
  highlightedPayload: string;
  highlightedResponse: string;
  copyLabel: string;
  onCopy: () => void;
};

export default function PayloadPreview({
  payloadTab,
  onSelectTab,
  isLoading,
  orderResponse,
  highlightedPayload,
  highlightedResponse,
  copyLabel,
  onCopy,
}: Props) {
  return (
    <div className={styles.payloadCard}>
      <div className={styles.payloadTabs}>
        <button
          className={cx(styles.payloadTabBtn, payloadTab === "request" && styles.active)}
          onClick={() => onSelectTab("request")}
        >
          Request
        </button>
        <button
          className={cx(styles.payloadTabBtn, payloadTab === "response" && styles.active)}
          onClick={() => onSelectTab("response")}
        >
          Response
          {!isLoading && orderResponse && (
            <span className={cx(styles.statusChip, orderResponse.status < 300 && styles.statusOk)}>
              {orderResponse.status}
            </span>
          )}
        </button>
      </div>
      <div className={styles.payloadHead}>
        <span className={styles.payloadTitle}>
          {payloadTab === "request"
            ? "POST /api/v1/orders/create/"
            : isLoading
            ? "Processing..."
            : orderResponse
            ? `${orderResponse.status} ${STATUS_TEXT[orderResponse.status] ?? ""}`
            : "No response yet"}
        </span>
        <button className={styles.payloadCopy} onClick={onCopy}>
          {copyLabel}
        </button>
      </div>
      {payloadTab === "request" ? (
        <pre className={styles.payloadPre} dangerouslySetInnerHTML={{ __html: highlightedPayload }} />
      ) : isLoading ? (
        <div className={styles.payloadLoading}>
          <Spinner size={14} />
          Processing request...
        </div>
      ) : orderResponse ? (
        <pre className={styles.payloadPre} dangerouslySetInnerHTML={{ __html: highlightedResponse }} />
      ) : (
        <div className={styles.payloadEmpty}>Click &ldquo;Place Order&rdquo; to see the response.</div>
      )}
    </div>
  );
}
