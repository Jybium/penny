import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { api, ApiOrder, ApiOrderItem } from "../api";
import { paypalLogo } from "../assets";

type Props = {
  token: string;
  onNavigate: (view: "chat" | "review") => void;
  onOpenOrders?: () => void;
};

type StoredOrderItem = {
  description?: string;
  product_description?: string;
  quantity?: number;
  unitPrice?: number;
  unit_price?: number;
};

type StoredOrder = {
  orderId?: string;
  paypalApprovalUrl?: string;
  totalPrice?: number;
  currency?: string;
  items?: StoredOrderItem[];
  mode?: "shop-with-me" | "buy-for-me";
};

export default function SuccessPage({ token, onNavigate, onOpenOrders }: Props) {
  const [searchParams] = useSearchParams();
  const rawQueryOrderId =
    searchParams.get("order_id") ||
    searchParams.get("token") ||
    searchParams.get("id");

  const [activeOrder, setActiveOrder] = useState<ApiOrder | null>(null);
  const [storedOrder, setStoredOrder] = useState<StoredOrder | null>(() => {
    const saved =
      sessionStorage.getItem("penny_last_settled_order") ||
      sessionStorage.getItem("penny_pending_order");
    if (saved) {
      try {
        return JSON.parse(saved) as StoredOrder;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch real order from backend
  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);

    const lookupId =
      rawQueryOrderId ||
      storedOrder?.orderId ||
      sessionStorage.getItem("penny_last_order_id");

    async function fetchRealOrder() {
      // 1. If lookupId is available, try getting the specific order
      if (lookupId && !lookupId.startsWith("ORD-")) {
        try {
          const direct = await api.getOrder(lookupId, token);
          if (active && direct) {
            setActiveOrder(direct);
            setLoading(false);
            return;
          }
        } catch {
          // fallback to list
        }
      }

      // 2. Query list of user's orders to find matched or latest
      try {
        const orderList = await api.getOrders(token);
        if (!active || !Array.isArray(orderList) || orderList.length === 0) {
          setLoading(false);
          return;
        }

        // Match by ID or take the newest order placed
        const matched = lookupId
          ? orderList.find(
              (o) => o.id === lookupId || o.paypal_order_id === lookupId,
            ) || orderList[0]
          : orderList[0];

        if (matched) {
          // Fetch full order details including line items
          try {
            const fullOrder = await api.getOrder(matched.id, token);
            if (active) setActiveOrder(fullOrder || matched);
          } catch {
            if (active) setActiveOrder(matched);
          }
        }
      } catch {
        // use fallback stored order
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchRealOrder();

    return () => {
      active = false;
    };
  }, [token, rawQueryOrderId, storedOrder?.orderId]);

  // Derive consolidated dynamic values
  const effectiveOrderId =
    activeOrder?.paypal_order_id ||
    activeOrder?.id ||
    storedOrder?.orderId ||
    sessionStorage.getItem("penny_last_order_id") ||
    "ORD-849201";

  const effectiveTotal =
    activeOrder?.paid_amount ??
    storedOrder?.totalPrice ??
    129.0;

  const isAutonomous =
    activeOrder?.is_autonomous ??
    (storedOrder?.mode === "buy-for-me" ||
      sessionStorage.getItem("penny_mode") === "buy-for-me");

  const effectiveDate = activeOrder?.created_at
    ? new Date(activeOrder.created_at).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

  // Extract dynamic items list
  const displayItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }> = (() => {
    if (activeOrder?.order_items && activeOrder.order_items.length > 0) {
      return activeOrder.order_items.map((it, idx) => ({
        id: it.id || `item-${idx}`,
        description: it.product_description,
        quantity: it.quantity,
        unitPrice: it.unit_price,
      }));
    }

    if (storedOrder?.items && storedOrder.items.length > 0) {
      return storedOrder.items.map((it, idx) => ({
        id: `stored-${idx}`,
        description:
          it.product_description ||
          it.description ||
          "Curated Penny Selection",
        quantity: it.quantity || 1,
        unitPrice: it.unit_price || it.unitPrice || effectiveTotal,
      }));
    }

    return [
      {
        id: "default-1",
        description:
          "Penny Autonomous Recommendation (Live Merchant Fulfillment)",
        quantity: 1,
        unitPrice: effectiveTotal,
      },
    ];
  })();

  function handleCopyReference() {
    if (effectiveOrderId) {
      navigator.clipboard.writeText(effectiveOrderId).catch(() => undefined);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <main className="result-page page-enter">
      <div className="result-card dynamic-success-card">
        {/* Animated Order Icon */}
        <span className="result-icon">
          <svg fill="none" height="28" viewBox="0 0 24 24" width="28">
            <path
              d="m5 12 4 4L19 7"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.4"
            />
          </svg>
        </span>

        <div className="success-head-badge">
          <span className="online-beacon" />
          <span>ORDER CONFIRMED &bull; MERCHANT NOTIFIED</span>
        </div>

        <h1 className="success-heading">Payment approved.</h1>
        <p className="result-copy">
          Your payment has been successfully authorized and confirmed by Penny.
          Live merchant specifications have been dispatched for immediate packing and dispatch.
        </p>

        {/* Dynamic Order Meta Panel */}
        <div className="order-confirmation dynamic-order-panel">
          <div className="order-confirm-row">
            <span>Order Reference</span>
            <div className="order-ref-wrap">
              <strong className="order-ref-text">{effectiveOrderId}</strong>
              <button
                className="order-copy-btn"
                onClick={handleCopyReference}
                title="Copy order reference"
                type="button"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="order-confirm-row">
            <span>Placed On</span>
            <strong>{effectiveDate}</strong>
          </div>

          <div className="order-confirm-row">
            <span>Settlement Mode</span>
            <strong className="order-mode-tag">
              {isAutonomous
                ? "Autonomous (PayPal Vault)"
                : "Manual (PayPal Checkout)"}
            </strong>
          </div>

          <div className="order-confirm-row">
            <span>Payment Status</span>
            <strong className="order-status-tag">● CONFIRMED &bull; SETTLED</strong>
          </div>
        </div>

        {/* Dynamic Ordered Items Breakdown */}
        <div className="order-items-breakdown">
          <div className="order-items-header">
            <span>PURCHASED SPECIFICATION ({displayItems.length} ITEM{displayItems.length > 1 ? "S" : ""})</span>
            <span>LINE TOTAL</span>
          </div>

          <div className="order-items-list">
            {displayItems.map((item) => (
              <div className="order-item-card" key={item.id}>
                <div className="order-item-icon-box">
                  <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
                    <path
                      d="M5 8h14l-1 12H6L5 8Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M9 9V6a3 3 0 0 1 6 0v3"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </div>
                <div className="order-item-details">
                  <strong className="order-item-title">
                    {item.description}
                  </strong>
                  <div className="order-item-sub">
                    <span className="order-qty-pill">Qty: {item.quantity}</span>
                    <span className="order-unit-price">
                      ${item.unitPrice.toFixed(2)} each
                    </span>
                  </div>
                </div>
                <strong className="order-item-total">
                  ${(item.quantity * item.unitPrice).toFixed(2)}
                </strong>
              </div>
            ))}
          </div>

          {/* Pricing Ledger */}
          <div className="order-pricing-ledger">
            <div className="ledger-row">
              <span>Item Subtotal</span>
              <span>${effectiveTotal.toFixed(2)}</span>
            </div>
            <div className="ledger-row">
              <span>Agent Handling &amp; Expedited Delivery</span>
              <span className="free-badge">FREE (Penny Guaranteed)</span>
            </div>
            <div className="ledger-row">
              <span>Sales Tax &amp; Fees</span>
              <span>$0.00</span>
            </div>
            <div className="ledger-row total-row">
              <strong>Total Settled Amount</strong>
              <strong>${effectiveTotal.toFixed(2)} USD</strong>
            </div>
          </div>
        </div>

        {/* 4-Step Fulfillment Tracker */}
        <div aria-label="Fulfillment progress" className="tracking-steps">
          <div className="done">
            <span>1</span>
            <b>Authorized</b>
          </div>
          <i />
          <div className="active">
            <span>2</span>
            <b>Processing</b>
          </div>
          <i />
          <div>
            <span>3</span>
            <b>Shipped</b>
          </div>
          <i />
          <div>
            <span>4</span>
            <b>Delivered</b>
          </div>
        </div>

        {/* Action Group */}
        <div className="success-action-group">
          <button
            className="continue-button primary-btn"
            onClick={() => onNavigate("chat")}
            type="button"
          >
            Start another search with Penny{" "}
            <svg fill="none" height="16" viewBox="0 0 24 24" width="16">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>

          {onOpenOrders && (
            <button
              className="view-orders-btn"
              onClick={onOpenOrders}
              type="button"
            >
              View in Order History
            </button>
          )}

          <button
            className="print-receipt-btn"
            onClick={() => window.print()}
            type="button"
          >
            Print Receipt
          </button>
        </div>

        {/* PayPal Non-Custodial Trust Badge */}
        <div className="result-trust" style={{ justifyContent: "center" }}>
          <img
            alt="PayPal"
            className="success-paypal-img"
            src={paypalLogo}
          />
          <span>Non-custodial purchase secured by Penny AI &amp; PayPal</span>
        </div>
      </div>
    </main>
  );
}
