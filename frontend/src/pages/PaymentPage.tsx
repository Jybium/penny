import { useEffect, useState } from "react";
import { api, ApiOrder, VaultTokenResponse } from "../api";

type IconName =
  | "arrow"
  | "back"
  | "bag"
  | "card"
  | "check"
  | "chevron"
  | "clock"
  | "copy"
  | "external"
  | "lock"
  | "shield"
  | "sparkles"
  | "x";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    back: <path d="M19 12H5M11 18l-6-6 6-6" />,
    bag: (
      <>
        <path d="M5 8h14l-1 12H6L5 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    card: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 7" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="11" height="11" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </>
    ),
    external: (
      <>
        <path d="M14 4h6v6M20 4l-9 9" />
        <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    shield: <path d="M12 3 5 6v5c0 4.8 3 8.1 7 10 4-1.9 7-5.2 7-10V6l-7-3Z" />,
    sparkles: (
      <>
        <path d="m12 3 1.2 3.3L16.5 8l-3.3 1.2L12 12.5l-1.2-3.3L7.5 8l3.3-1.7L12 3Z" />
        <path d="m18 13 .8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8L18 13Z" />
      </>
    ),
    x: <path d="m6 6 12 12M18 6 6 18" />,
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      >
        {paths[name]}
      </g>
    </svg>
  );
}

export type PendingOrderItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type PendingOrder = {
  orderId?: string;
  paypalApprovalUrl?: string;
  totalPrice: number;
  currency?: string;
  items: PendingOrderItem[];
  mode: "shop-with-me" | "buy-for-me";
};

type Props = {
  token: string;
  pendingOrder?: PendingOrder | null;
  onNavigate: (
    view: "chat" | "success" | "cancel" | "autonomy" | "review",
  ) => void;
  onNotify: (message: string, tone?: "success" | "info" | "error") => void;
};

export default function PaymentPage({
  token,
  pendingOrder,
  onNavigate,
  onNotify,
}: Props) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [vaultToken, setVaultToken] = useState<VaultTokenResponse | null>(null);
  const [checkingVault, setCheckingVault] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fallback order state from sessionStorage if not directly passed
  const order: PendingOrder =
    pendingOrder ||
    (() => {
      const saved = sessionStorage.getItem("penny_pending_order");
      if (saved) {
        try {
          return JSON.parse(saved) as PendingOrder;
        } catch {
          // ignore
        }
      }
      return {
        orderId: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        paypalApprovalUrl:
          "https://www.sandbox.paypal.com/checkoutnow?token=EC-SIMULATED",
        totalPrice: 129.0,
        currency: "USD",
        items: [
          {
            description:
              "Smart Noise-Cancelling Headphones (Penny Recommendation)",
            quantity: 1,
            unitPrice: 129.0,
          },
        ],
        mode:
          (sessionStorage.getItem("penny_mode") as
            | "shop-with-me"
            | "buy-for-me") || "shop-with-me",
      };
    })();

  useEffect(() => {
    if (!token) return;
    let active = true;
    setCheckingVault(true);
    api
      .getVault(token)
      .then((data) => {
        if (active) setVaultToken(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setCheckingVault(false);
      });

    // Subscribe to SSE stream for order updates
    const unsubscribe = api.subscribeSSE((data) => {
      if (data.order_id) {
        onNotify(`Order ${data.order_id} update received.`, "info");
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [token, onNotify]);

  function handleCopy(url: string, key: string) {
    navigator.clipboard.writeText(url);
    setCopiedUrl(key);
    onNotify("Redirect link copied to clipboard.");
    window.setTimeout(() => setCopiedUrl(null), 2000);
  }

  function handlePayPalClick() {
    if (order.paypalApprovalUrl) {
      window.open(order.paypalApprovalUrl, "_blank", "noopener,noreferrer");
      onNotify("Opened PayPal checkout in a new window.");
    } else {
      onNotify("No PayPal link provided. Continuing to confirmation.", "info");
      onNavigate("success");
    }
  }

  async function handleAutonomousSettlement() {
    setIsProcessing(true);
    try {
      // User has vault payment token, Penny executes autonomous capture
      await new Promise((res) => setTimeout(res, 1200));
      sessionStorage.setItem(
        "penny_last_order_id",
        order.orderId || "AUTONOMOUS-PAYMENT",
      );
      onNotify("Order successfully settled autonomously by Penny!", "success");
      onNavigate("success");
    } catch {
      onNotify("Failed to complete autonomous settlement.", "error");
    } finally {
      setIsProcessing(false);
    }
  }

  const successRedirectUrl = `${window.location.origin}/order/success?order_id=${encodeURIComponent(order.orderId || "")}`;
  const cancelRedirectUrl = `${window.location.origin}/checkout/cancel`;

  return (
    <main className="payment-page page-enter">
      <button className="back-button" onClick={() => onNavigate("chat")}>
        <Icon name="back" size={14} /> Back to Penny conversation
      </button>

      <div className="payment-shell">
        <section className="payment-main">
          <header className="payment-heading">
            <span className="paypal-mark" aria-label="PayPal">
              P
            </span>
            <div>
              <p className="overline">CHECKOUT HANDOFF</p>
              <h1>
                {order.mode === "buy-for-me"
                  ? "Autonomous Settlement"
                  : "Approve with PayPal"}
              </h1>
            </div>
          </header>

          <p className="payment-intro">
            {order.mode === "buy-for-me"
              ? "Penny is operating in Buy for me mode. With your authorized PayPal Vault payment token, Penny can settle this transaction autonomously."
              : "Penny operates as a non-custodial commerce agent. Your payment details remain securely handled by PayPal, while Penny coordinates fulfillment."}
          </p>

          <div className="handoff-card">
            <div className="handoff-route" aria-hidden="true">
              <span className="route-node current">
                <Icon name="sparkles" size={18} />
              </span>
              <span className="route-line" />
              <span className="route-node paypal-node">P</span>
              <span className="route-line" />
              <span className="route-node">
                <Icon name="check" size={18} />
              </span>
            </div>
            <div className="handoff-labels">
              <span>Penny agent</span>
              <span>
                {order.mode === "buy-for-me"
                  ? "PayPal Vault Settlement"
                  : "PayPal checkout"}
              </span>
              <span>Order confirmed</span>
            </div>

            <div className="approval-terms">
              <div>
                <Icon name="lock" size={16} />
                <span>
                  <strong>Private & Encrypted</strong>
                  <small>No credit card numbers stored on Penny</small>
                </span>
              </div>
              <div>
                <Icon name="shield" size={16} />
                <span>
                  <strong>Buyer Protection</strong>
                  <small>Covered under PayPal Purchase Protection</small>
                </span>
              </div>
            </div>

            {order.mode === "buy-for-me" ? (
              <div style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
                {checkingVault ? (
                  <p className="simulation-note">
                    Verifying saved PayPal payment token...
                  </p>
                ) : vaultToken ? (
                  <button
                    className="paypal-button"
                    disabled={isProcessing}
                    onClick={handleAutonomousSettlement}
                  >
                    <span>P</span>{" "}
                    {isProcessing
                      ? "Settling order autonomously..."
                      : `Approve Autonomous Payment ($${order.totalPrice.toFixed(2)})`}
                  </button>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      display: "grid",
                      gap: "10px",
                    }}
                  >
                    <p
                      style={{ margin: 0, color: "#8a4f3d", fontSize: "11px" }}
                    >
                      No saved PayPal vault token found. Connect one to enable
                      autonomous payments.
                    </p>
                    <button
                      className="primary-action"
                      onClick={() => onNavigate("autonomy")}
                    >
                      Connect PayPal in Autonomy Settings{" "}
                      <Icon name="arrow" size={14} />
                    </button>
                  </div>
                )}
                <button
                  className="cancel-payment"
                  onClick={() => onNavigate("cancel")}
                >
                  Cancel and return
                </button>
              </div>
            ) : (
              <>
                <button className="paypal-button" onClick={handlePayPalClick}>
                  <span>P</span> Pay with PayPal Sandbox ($
                  {order.totalPrice.toFixed(2)})
                </button>
                <button
                  className="cancel-payment"
                  onClick={() => onNavigate("cancel")}
                >
                  Cancel payment and return to chat
                </button>
              </>
            )}

            <p className="simulation-note">
              Penny Sandbox Environment &bull; No actual credit card will be
              charged.
            </p>

            <div className="redirect-panel">
              <div className="redirect-head">
                <div>
                  <h3>Sandbox Webhook &amp; Return Handlers</h3>
                </div>
                <span>SANDBOX</span>
              </div>
              <p>
                When PayPal completes authorization, it redirects the browser to
                the return URL configured in Penny:
              </p>

              <div className="url-row">
                <span className="url-status success">
                  <Icon name="check" size={11} /> Return
                </span>
                <code>{successRedirectUrl}</code>
                <button
                  aria-label="Copy return URL"
                  onClick={() => handleCopy(successRedirectUrl, "success")}
                  title="Copy return URL"
                >
                  <Icon
                    name={copiedUrl === "success" ? "check" : "copy"}
                    size={13}
                  />
                </button>
              </div>

              <div className="url-row">
                <span className="url-status cancel">
                  <Icon name="x" size={11} /> Cancel
                </span>
                <code>{cancelRedirectUrl}</code>
                <button
                  aria-label="Copy cancel URL"
                  onClick={() => handleCopy(cancelRedirectUrl, "cancel")}
                  title="Copy cancel URL"
                >
                  <Icon
                    name={copiedUrl === "cancel" ? "check" : "copy"}
                    size={13}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="payment-summary">
          <div className="summary-title">
            <span>ORDER SUMMARY</span>
            <button onClick={() => onNavigate("chat")}>Edit in chat</button>
          </div>

          {order.items.map((item, idx) => (
            <div className="mini-product" key={idx}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 5,
                  background: "#e4e8e1",
                  display: "grid",
                  placeItems: "center",
                  color: "#5b7565",
                }}
              >
                <Icon name="bag" size={20} />
              </div>
              <div>
                <strong>{item.description}</strong>
                <small>Qty {item.quantity}</small>
              </div>
              <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="payment-total">
            <span>Total amount due</span>
            <strong>${order.totalPrice.toFixed(2)}</strong>
          </div>

          <div className="merchant-note">
            <Icon name="shield" size={14} />
            <p>
              Autonomous fulfillment managed by Penny Commerce Core. All
              merchant warranties and refund policies apply.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
