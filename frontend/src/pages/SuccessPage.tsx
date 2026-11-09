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

export default function SuccessPage({
  token,
  onNavigate,
  onOpenOrders,
}: Props) {
  const [searchParams] = useSearchParams();
  const rawQueryOrderId =
    searchParams.get("order_id") ||
    searchParams.get("token") ||
    searchParams.get("id");

  const [activeOrder, setActiveOrder] = useState<ApiOrder | null>(null);
  const [storedOrder, setStoredOrder] = useState<StoredOrder | null>(() => {
    const saved =
      localStorage.getItem("penny_last_settled_order") ||
      sessionStorage.getItem("penny_last_settled_order") ||
      localStorage.getItem("penny_pending_order") ||
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
  const [isCapturing, setIsCapturing] = useState(false);

  async function handleContinueWithPenny() {
    const activeToken =
      token ||
      localStorage.getItem("penny_access_token") ||
      sessionStorage.getItem("penny_access_token") ||
      "";

    if (!activeToken) {
      onNavigate("chat");
      return;
    }

    setIsCapturing(true);
    try {
      const response = await api.chat(
        "capture payment for the order",
        activeToken,
      );
      const pennyText =
        typeof response === "string"
          ? response
          : response?.penny || "Your payment has been captured successfully.";

      sessionStorage.setItem(
        "penny_pending_chat_injection",
        JSON.stringify({
          userMessage: "capture payment for the order",
          pennyReply: pennyText,
        }),
      );
    } catch (err) {
      console.warn("Could not capture payment via agent:", err);
    } finally {
      setIsCapturing(false);
      onNavigate("chat");
    }
  }

  // Fetch real order from backend
  useEffect(() => {
    try {
      localStorage.removeItem("penny_pending_order");
      sessionStorage.removeItem("penny_pending_order");
    } catch {
      // ignore
    }

    const activeToken =
      token ||
      localStorage.getItem("penny_access_token") ||
      sessionStorage.getItem("penny_access_token") ||
      "";

    if (!activeToken) return;
    let active = true;
    setLoading(true);

    const lookupId =
      rawQueryOrderId ||
      storedOrder?.orderId ||
      localStorage.getItem("penny_last_order_id") ||
      sessionStorage.getItem("penny_last_order_id");

    async function fetchRealOrder() {
      // 1. If lookupId is available, try getting the specific order
      if (lookupId && !lookupId.startsWith("ORD-")) {
        try {
          const direct = await api.getOrder(lookupId, activeToken);
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
        const orderList = await api.getOrders(activeToken);
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
            const fullOrder = await api.getOrder(matched.id, activeToken);
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
    localStorage.getItem("penny_last_order_id") ||
    sessionStorage.getItem("penny_last_order_id") ||
    "ORD-849201";

  const effectiveTotal =
    activeOrder?.paid_amount ?? storedOrder?.totalPrice ?? 129.0;

  const isAutonomous =
    activeOrder?.is_autonomous ??
    (storedOrder?.mode === "buy-for-me" ||
      localStorage.getItem("penny_mode") === "buy-for-me" ||
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
          it.product_description || it.description || "Curated Penny Selection",
        quantity: it.quantity || 1,
        unitPrice: it.unit_price || it.unitPrice || effectiveTotal,
      }));
    }

    return [
      {
        id: "default-1",
        description: "Penny Autonomous Recommendation",
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
      <div className="result-card dynamic-success-card lean-success-card">
        {/* Order Success Checkmark Icon */}
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

        <h1 className="success-heading">Payment approved.</h1>
        <p className="result-copy">
          Your payment has been authorized with PayPal. Continue with Penny to
          capture payment and return to chat.
        </p>

        {/* Action Group */}
        <div className="success-action-group">
          <button
            className="continue-button primary-btn"
            disabled={isCapturing}
            onClick={handleContinueWithPenny}
            type="button"
          >
            {isCapturing ? (
              <>
                <span className="button-spinner" /> Capturing payment with
                Penny...
              </>
            ) : (
              <>
                Continue with Penny{" "}
                <svg fill="none" height="16" viewBox="0 0 24 24" width="16">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
              </>
            )}
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
        </div>
      </div>
    </main>
  );
}
