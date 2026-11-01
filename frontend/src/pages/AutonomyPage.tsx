import { useEffect, useState } from "react"
import { api, VaultTokenResponse } from "../api"

type Props = {
  token: string
  onNavigate: (view: "chat" | "payment" | "review") => void
  onNotify: (message: string, tone?: "success" | "info" | "error") => void
}

export default function AutonomyPage({ token, onNavigate, onNotify }: Props) {
  const [vaultToken, setVaultToken] = useState<VaultTokenResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [setupLoading, setSetupLoading] = useState(false)
  const [exchangeLoading, setExchangeLoading] = useState(false)
  const [approvalLink, setApprovalLink] = useState<string | null>(null)
  const [setupTokenId, setSetupTokenId] = useState<string>("")
  const [manualTokenInput, setManualTokenInput] = useState("")

  const [activeMode, setActiveMode] = useState<"shop-with-me" | "buy-for-me">(() => {
    return sessionStorage.getItem("penny_mode") === "buy-for-me"
      ? "buy-for-me"
      : "shop-with-me"
  })

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    api
      .getVault(token)
      .then((data) => {
        if (active) {
          setVaultToken(data)
          if (data) {
            setActiveMode("buy-for-me")
            sessionStorage.setItem("penny_mode", "buy-for-me")
          }
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [token])

  async function handleStartSetup() {
    if (!token) {
      onNotify("Please sign in first to configure autonomous payments.", "error")
      return
    }
    setSetupLoading(true)
    try {
      const response = await api.createVaultSetupToken(token)
      const link = response.paypal_response?.payer_vault_setup_approval_link
      const id = response.paypal_response?.vault_setup_token_id
      if (link) {
        setApprovalLink(link)
        setSetupTokenId(id || "")
        setManualTokenInput(id || "")
        window.open(link, "_blank", "noopener,noreferrer")
        onNotify(
          "PayPal authorization window opened. Approve the setup token, then complete the exchange.",
          "info",
        )
      } else {
        onNotify("Could not retrieve PayPal vault setup link.", "error")
      }
    } catch (err: unknown) {
      onNotify(
        err instanceof Error ? err.message : "Failed to generate vault setup token.",
        "error",
      )
    } finally {
      setSetupLoading(false)
    }
  }

  async function handleExchangeToken() {
    const tokenToExchange = manualTokenInput.trim() || setupTokenId
    if (!tokenToExchange) {
      onNotify("Please provide a valid vault setup token ID.", "error")
      return
    }
    setExchangeLoading(true)
    try {
      await api.exchangeVaultSetupToken(tokenToExchange, token)
      const nextVault = await api.getVault(token)
      setVaultToken(nextVault)
      setActiveMode("buy-for-me")
      sessionStorage.setItem("penny_mode", "buy-for-me")
      setApprovalLink(null)
      onNotify("Autonomous payment token successfully activated!", "success")
    } catch (err: unknown) {
      onNotify(
        err instanceof Error
          ? err.message
          : "Failed to exchange setup token for payment token.",
        "error",
      )
    } finally {
      setExchangeLoading(false)
    }
  }

  async function handleDeleteVaultToken() {
    if (!window.confirm("Are you sure you want to revoke your saved PayPal payment token?")) {
      return
    }
    try {
      await api.deleteVault(token)
      setVaultToken(null)
      setActiveMode("shop-with-me")
      sessionStorage.setItem("penny_mode", "shop-with-me")
      onNotify("PayPal vault payment token revoked successfully.", "success")
    } catch (err: unknown) {
      onNotify(
        err instanceof Error ? err.message : "Failed to revoke vault token.",
        "error",
      )
    }
  }

  function handleModeChange(mode: "shop-with-me" | "buy-for-me") {
    if (mode === "buy-for-me" && !vaultToken) {
      onNotify("Connect a PayPal payment token first to activate Buy for me.", "info")
      return
    }
    setActiveMode(mode)
    sessionStorage.setItem("penny_mode", mode)
    onNotify(`Penny mode set to ${mode === "buy-for-me" ? "Buy for me" : "Shop with me"}.`)
  }

  return (
    <main className="payment-page page-enter">
      <button className="back-button" onClick={() => onNavigate("chat")}>
        <svg fill="none" height="14" viewBox="0 0 24 24" width="14">
          <path
            d="M19 12H5M11 18l-6-6 6-6"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>{" "}
        Back to Penny conversation
      </button>

      <div className="review-heading">
        <div>
          <p className="overline">AUTONOMOUS COMMERCE CONTROLS</p>
          <h1>Autonomous Payments &amp; PayPal Vault</h1>
          <p>
            Configure Penny's autonomous order settlement permissions. Saved payment tokens
            are non-custodial and tokenized securely via PayPal Vault.
          </p>
        </div>
      </div>

      <div className="payment-shell">
        <section className="payment-main">
          {loading ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#667" }}>
              <span className="button-spinner" /> Checking PayPal Vault authorization...
            </div>
          ) : vaultToken ? (
            <div className="autonomy-dashboard">
              <header>
                <div>
                  <span className="automation-pulse" />
                  <span>
                    <strong>Autonomous Payments: Active</strong>
                    <small>Encrypted PayPal payment token attached</small>
                  </span>
                </div>
                <b>TOKENIZED</b>
              </header>

              <div className="automation-limit">
                <span>
                  <small>AUTO-SETTLEMENT GUARDRAIL</small>
                  <strong>$250.00</strong>
                  <em>per purchase limit</em>
                </span>
                <span style={{ fontSize: "10px", color: "var(--penny-green)" }}>
                  Verified &bull; Non-Custodial
                </span>
              </div>

              <div className="automation-rules">
                <div>
                  <em>1</em>
                  <span>
                    <strong>Penny Autonomous Execution</strong>
                    <small>Penny agent auto-settles approved purchase orders</small>
                  </span>
                  <b>ENABLED</b>
                </div>
                <div>
                  <em>2</em>
                  <span>
                    <strong>Buyer Protection &amp; Receipts</strong>
                    <small>Instant PayPal confirmation email on every settlement</small>
                  </span>
                  <b>ACTIVE</b>
                </div>
                <div>
                  <em>3</em>
                  <span>
                    <strong>Revocation Guarantee</strong>
                    <small>Delete or disconnect token with immediate effect anytime</small>
                  </span>
                  <b>GUARANTEED</b>
                </div>
              </div>

              <footer style={{ justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span className="automation-check">
                    <svg fill="none" height="14" viewBox="0 0 24 24" width="14">
                      <path
                        d="m5 12 4 4L19 7"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </span>
                  <span>
                    <strong>Ready for Buy for me checkouts</strong>
                    <small>Penny can complete order settlement automatically</small>
                  </span>
                </div>

                <button
                  onClick={handleDeleteVaultToken}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d9534f",
                    borderRadius: "6px",
                    color: "#d9534f",
                    background: "#fff",
                    fontSize: "9px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Revoke Token
                </button>
              </footer>
            </div>
          ) : (
            <div className="handoff-card">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    color: "#352607",
                    background: "var(--penny-honey)",
                    fontWeight: "bold",
                  }}
                >
                  P
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Connect PayPal Vault Token</h3>
                  <small style={{ color: "#77817c" }}>
                    Enable Penny to complete checkouts autonomously without manual redirection
                  </small>
                </div>
              </div>

              <p style={{ fontSize: 11, color: "#66736d", lineHeight: 1.6 }}>
                To use Penny's <strong>Buy for me</strong> mode, PayPal requires you to approve a
                Vault Setup Token. This grants Penny non-custodial authorization to capture orders you
                confirm in chat.
              </p>

              {!approvalLink ? (
                <button
                  className="paypal-button"
                  disabled={setupLoading}
                  onClick={handleStartSetup}
                  style={{ marginTop: 14 }}
                >
                  <span>P</span>{" "}
                  {setupLoading
                    ? "Generating PayPal Vault Setup Token..."
                    : "Authorize PayPal Vault for Autonomous Payments"}
                </button>
              ) : (
                <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                  <div className="redirect-panel">
                    <p style={{ margin: 0, fontWeight: 700, color: "#416452" }}>
                      Step 1: Approve on PayPal Sandbox
                    </p>
                    <p style={{ margin: "6px 0 12px", fontSize: 10, color: "#69756f" }}>
                      A PayPal window opened. If it was blocked, click below to open it:
                    </p>
                    <a
                      className="primary-action"
                      href={approvalLink}
                      rel="noopener noreferrer"
                      style={{ textAlign: "center", textDecoration: "none" }}
                      target="_blank"
                    >
                      Open PayPal Vault Approval Link &rarr;
                    </a>
                  </div>

                  <div className="redirect-panel">
                    <p style={{ margin: 0, fontWeight: 700, color: "#416452" }}>
                      Step 2: Complete Token Exchange
                    </p>
                    <p style={{ margin: "6px 0 10px", fontSize: 10, color: "#69756f" }}>
                      Once approved, click to exchange your setup token for the secure payment token:
                    </p>

                    <label style={{ display: "grid", gap: 4, fontSize: 9, fontWeight: 700 }}>
                      Setup Token ID:
                      <input
                        onChange={(e) => setManualTokenInput(e.target.value)}
                        placeholder="Setup token ID (e.g. 8D548483N8830151S)"
                        style={{
                          height: 38,
                          padding: "0 10px",
                          border: "1px solid #ccd1ca",
                          borderRadius: 6,
                          fontSize: 10,
                        }}
                        value={manualTokenInput}
                      />
                    </label>

                    <button
                      className="primary-action"
                      disabled={exchangeLoading}
                      onClick={handleExchangeToken}
                      style={{ marginTop: 10 }}
                    >
                      {exchangeLoading
                        ? "Exchanging Setup Token..."
                        : "Complete Setup Token Exchange"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 28 }}>
            <p className="overline">MODE SELECTOR</p>
            <div className="penny-modes" style={{ marginTop: 10 }}>
              <div
                onClick={() => handleModeChange("shop-with-me")}
                style={{
                  cursor: "pointer",
                  background: activeMode === "shop-with-me" ? "#fff8e3" : undefined,
                  border: activeMode === "shop-with-me" ? "1px solid var(--penny-honey)" : undefined,
                }}
              >
                <span>1</span>
                <strong>Shop with me</strong>
                <small>You review recommendations and complete checkout manually via PayPal.</small>
              </div>

              <div
                onClick={() => handleModeChange("buy-for-me")}
                style={{
                  cursor: "pointer",
                  background: activeMode === "buy-for-me" ? "#fff8e3" : undefined,
                  border: activeMode === "buy-for-me" ? "1px solid var(--penny-honey)" : undefined,
                }}
              >
                <span>2</span>
                <strong>Buy for me (Autonomous)</strong>
                <small>Penny automatically captures and settles orders using your saved PayPal token.</small>
              </div>
            </div>
          </div>
        </section>

        <aside className="payment-summary">
          <div className="summary-title">
            <span>AUTONOMY ARCHITECTURE</span>
          </div>

          <p style={{ fontSize: 10, color: "#6f7974", lineHeight: 1.6 }}>
            Penny's autonomous commerce architecture relies on LangGraph agent state machines and
            PayPal's Vault APIs:
          </p>

          <div className="decision-details">
            <div>
              <svg fill="none" height="15" viewBox="0 0 24 24" width="15">
                <path
                  d="M12 3 5 6v5c0 4.8 3 8.1 7 10 4-1.9 7-5.2 7-10V6l-7-3Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              <span>
                <strong>Zero Credential Storage</strong>
                <small>Card details never pass through Penny servers</small>
              </span>
            </div>

            <div>
              <svg fill="none" height="15" viewBox="0 0 24 24" width="15">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <span>
                <strong>Idempotent Operations</strong>
                <small>Every payment call contains a unique UUID idempotency key</small>
              </span>
            </div>

            <div>
              <svg fill="none" height="15" viewBox="0 0 24 24" width="15">
                <path
                  d="m12 3 1.2 3.3L16.5 8l-3.3 1.2L12 12.5l-1.2-3.3L7.5 8l3.3-1.7L12 3Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              <span>
                <strong>Live SSE Telemetry</strong>
                <small>Order creation stream notifies client in real-time</small>
              </span>
            </div>
          </div>

          <button
            className="continue-button"
            onClick={() => onNavigate("chat")}
            style={{ marginTop: 20 }}
          >
            Return to Shopping &rarr;
          </button>
        </aside>
      </div>
    </main>
  )
}

