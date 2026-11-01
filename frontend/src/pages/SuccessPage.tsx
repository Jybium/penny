import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { api, ApiOrder } from "../api";

type Props = {
  token: string;
  onNavigate: (view: "chat" | "review") => void;
};

export default function SuccessPage({ token, onNavigate }: Props) {
  const [searchParams] = useSearchParams();
  const orderId =
    searchParams.get("order_id") ||
    searchParams.get("token") ||
    sessionStorage.getItem("penny_last_order_id") ||
    "ORD-" + Math.floor(100000 + Math.random() * 900000);

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    setLoading(true);
    api
      .getOrders(token)
      .then((data) => {
        if (active && Array.isArray(data)) setOrders(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const matchedOrder = orders.find(
    (o) => o.id === orderId || o.paypal_order_id === orderId,
  );

  return (
    <main className="result-page page-enter">
      <div className="result-card">
        <span className="result-icon">
          <svg fill="none" height="28" viewBox="0 0 24 24" width="28">
            <path
              d="m5 12 4 4L19 7"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
            />
          </svg>
        </span>

        <p className="overline">ORDER SETTLED</p>
        <h1>Payment approved.</h1>
        <p className="result-copy">
          Your payment has been successfully authorized and confirmed by Penny.
          The merchant has received the order specification and preparation has
          begun.
        </p>

        <div className="order-confirmation">
          <div>
            <span>Order Reference</span>
            <strong>{matchedOrder?.paypal_order_id || orderId}</strong>
          </div>
          <div>
            <span>Settlement Mode</span>
            <strong>
              {matchedOrder?.is_autonomous ||
              sessionStorage.getItem("penny_mode") === "buy-for-me"
                ? "Autonomous (PayPal Vault)"
                : "Manual (PayPal Checkout)"}
            </strong>
          </div>
          <div>
            <span>Amount Paid</span>
            <strong>
              ${matchedOrder ? matchedOrder.paid_amount.toFixed(2) : "129.00"}{" "}
              USD
            </strong>
          </div>
          <div>
            <span>Status</span>
            <strong style={{ color: "var(--penny-green)" }}>CONFIRMED</strong>
          </div>
        </div>

        <div className="tracking-steps" aria-label="Fulfillment progress">
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

        <button className="continue-button" onClick={() => onNavigate("chat")}>
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

        <div className="result-trust" style={{ justifyContent: "center" }}>
          <svg fill="none" height="13" viewBox="0 0 24 24" width="13">
            <path
              d="M12 3 5 6v5c0 4.8 3 8.1 7 10 4-1.9 7-5.2 7-10V6l-7-3Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
          <span>Non-custodial purchase secured by Penny AI &amp; PayPal</span>
        </div>
      </div>
    </main>
  );
}
