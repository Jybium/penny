import { useEffect, useState } from "react"
import { api, ApiOrder } from "./api"

type Props = {
  isOpen: boolean
  token: string
  onClose: () => void
  onNotify: (message: string, tone?: "success" | "info" | "error") => void
}

export default function OrdersModal({ isOpen, token, onClose, onNotify }: Props) {
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<ApiOrder | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Fetch all orders on modal open
  useEffect(() => {
    if (!isOpen || !token) return
    loadOrders()
  }, [isOpen, token])

  async function loadOrders() {
    setLoading(true)
    try {
      const data = await api.getOrders(token)
      setOrders(data)
    } catch (err: unknown) {
      onNotify(
        err instanceof Error ? err.message : "Failed to load orders.",
        "error",
      )
    } finally {
      setLoading(false)
    }
  }

  // Fetch individual order details via GET /orders/own/{order_id}
  async function handleSelectOrder(orderId: string) {
    setSelectedOrderId(orderId)
    setDetailLoading(true)
    try {
      const details = await api.getOrder(orderId, token)
      setSelectedOrderDetails(details)
    } catch (err: unknown) {
      onNotify(
        err instanceof Error ? err.message : "Failed to load order details.",
        "error",
      )
    } finally {
      setDetailLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      aria-label="Your Orders Modal"
      aria-modal="true"
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(18, 24, 21, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        className="modal-panel page-enter"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: 12,
          maxWidth: 680,
          width: "100%",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 48px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          border: "1px solid #d5ded7",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e1e8e3",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#f8faf8",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#e4ece6",
                display: "grid",
                placeItems: "center",
                color: "#274836",
              }}
            >
              <svg fill="none" height="16" viewBox="0 0 24 24" width="16">
                <path
                  d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <path d="M3 6h18" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M8 10V7a4 4 0 0 1 8 0v3"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, color: "#1c2c23" }}>Your Orders</h2>
              <p style={{ margin: 0, fontSize: 11, color: "#6e7e75" }}>
                Past purchases and autonomous settlements by Penny
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={loadOrders}
              style={{
                background: "transparent",
                border: "1px solid #d0dcd4",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 11,
                cursor: "pointer",
                color: "#355042",
              }}
              title="Refresh orders list"
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
            <button
              aria-label="Close"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "#74837b",
                padding: "4px 8px",
              }}
            >
              &times;
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {selectedOrderId && (
            <button
              onClick={() => {
                setSelectedOrderId(null)
                setSelectedOrderDetails(null)
              }}
              style={{
                background: "none",
                border: "none",
                color: "#2a5942",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 16,
              }}
            >
              &larr; Back to all orders
            </button>
          )}

          {/* Single Order Detail View */}
          {selectedOrderId ? (
            detailLoading ? (
              <p style={{ color: "#77857d", fontSize: 12 }}>Loading order #{selectedOrderId} details...</p>
            ) : selectedOrderDetails ? (
              <div style={{ display: "grid", gap: 16 }}>
                <div
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    border: "1px solid #d7e0d9",
                    background: "#fbfcfa",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: 9, font: "700 8px 'DM Mono'", color: "#77857d" }}>ORDER ID</span>
                      <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: "bold", color: "#1d2f25" }}>
                        {selectedOrderDetails.id}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: 4,
                        fontSize: 9,
                        font: "700 9px 'DM Mono'",
                        background: selectedOrderDetails.is_autonomous ? "#def2e6" : "#fbf2de",
                        color: selectedOrderDetails.is_autonomous ? "#1d583c" : "#725316",
                      }}
                    >
                      {selectedOrderDetails.is_autonomous ? "AUTONOMOUS (BUY FOR ME)" : "MANUAL (SHOP FOR ME)"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 11, color: "#54645d" }}>
                    <div>
                      <span style={{ fontSize: 9, color: "#8a9690" }}>PAYPAL ORDER ID</span>
                      <div style={{ fontFamily: "monospace", color: "#223329", fontWeight: 600 }}>
                        {selectedOrderDetails.paypal_order_id || "N/A"}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 9, color: "#8a9690" }}>TOTAL PAID</span>
                      <div style={{ fontSize: 14, fontWeight: "bold", color: "#1e3a2b" }}>
                        ${selectedOrderDetails.paid_amount.toFixed(2)} USD
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 9, color: "#8a9690" }}>CREATED AT</span>
                      <div>
                        {selectedOrderDetails.created_at
                          ? new Date(selectedOrderDetails.created_at).toLocaleString()
                          : "Recently"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 style={{ margin: "0 0 10px", fontSize: 12, color: "#2d3e34" }}>Order Items</h4>
                  {selectedOrderDetails.order_items && selectedOrderDetails.order_items.length > 0 ? (
                    <div style={{ display: "grid", gap: 8 }}>
                      {selectedOrderDetails.order_items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 14px",
                            borderRadius: 6,
                            background: "#f4f7f5",
                            border: "1px solid #e2eae4",
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: 12, color: "#1e2c24" }}>{item.product_description}</strong>
                            <div style={{ fontSize: 10, color: "#6e7e76" }}>Qty: {item.quantity}</div>
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 12, color: "#1e2c24" }}>
                            ${item.unit_price.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 11, color: "#77857d" }}>No item details recorded for this order.</p>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ color: "#77857d", fontSize: 12 }}>Order details could not be loaded.</p>
            )
          ) : (
            /* Orders List View */
            <div>
              {loading ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: "#687a71", fontSize: 12 }}>
                  Loading your orders from Penny...
                </div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "#223129" }}>
                    No orders placed yet
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#708077", lineHeight: 1.5 }}>
                    When you approve a checkout or let Penny buy for you autonomously, your fulfilled orders will appear here.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => handleSelectOrder(ord.id)}
                      style={{
                        padding: 14,
                        borderRadius: 8,
                        border: "1px solid #dce4de",
                        background: "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f7faf8")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#192820" }}>
                            {ord.id.length > 12 ? `${ord.id.slice(0, 10)}...` : ord.id}
                          </span>
                          <span
                            style={{
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 8,
                              font: "700 8px 'DM Mono'",
                              background: ord.is_autonomous ? "#def2e6" : "#fbf2de",
                              color: ord.is_autonomous ? "#1d583c" : "#725316",
                            }}
                          >
                            {ord.is_autonomous ? "AUTONOMOUS" : "MANUAL"}
                          </span>
                        </div>
                        <div style={{ fontSize: 10, color: "#77857e" }}>
                          {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : "Recent Order"} &bull;{" "}
                          {ord.order_items?.length || 1} item(s)
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#193526" }}>
                          ${ord.paid_amount.toFixed(2)}
                        </div>
                        <span style={{ fontSize: 10, color: "#366a50" }}>View details &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
