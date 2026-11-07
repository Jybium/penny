import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { api, VaultTokenResponse } from "../api";
import { paypalLogo } from "../assets";

type Props = {
  token: string;
  onNavigate: (view: "chat" | "payment" | "review") => void;
  onNotify: (message: string, tone?: "success" | "info" | "error") => void;
};

export default function AutonomyPage({ token, onNavigate, onNotify }: Props) {
  const [searchParams] = useSearchParams();
  const [vaultToken, setVaultToken] = useState<VaultTokenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupLoading, setSetupLoading] = useState(false);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [approvalLink, setApprovalLink] = useState<string | null>(null);
  const [setupTokenId, setSetupTokenId] = useState<string>(
    () => sessionStorage.getItem("penny_vault_setup_token_id") || "",
  );

  const [activeMode, setActiveMode] = useState<"shop-with-me" | "buy-for-me">(
    () => {
      return sessionStorage.getItem("penny_mode") === "buy-for-me"
        ? "buy-for-me"
        : "shop-with-me";
    },
  );

  // Check vault token and handle return redirect
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    api
      .getVault(token)
      .then((data) => {
        if (!active) return;
        setVaultToken(data);
        if (data) {
          setActiveMode("buy-for-me");
          sessionStorage.setItem("penny_mode", "buy-for-me");
        } else {
          setActiveMode("shop-with-me");
          sessionStorage.setItem("penny_mode", "shop-with-me");
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });

    // If user approved on PayPal and returned with ?approved=true
    const isApprovedParam = searchParams.get("approved") === "true";
    const savedTokenId = sessionStorage.getItem("penny_vault_setup_token_id");
    if (isApprovedParam && savedTokenId && !vaultToken) {
      onNotify(
        "Detected PayPal approval return. Ready to complete activation.",
        "info",
      );
    }

    return () => {
      active = false;
    };
  }, [token, searchParams]);

  // Step 1: Call POST /vault/setup-token without a request body
  async function handleStartSetup() {
    if (!token) {
      onNotify(
        "Please sign in first to configure autonomous payments.",
        "error",
      );
      return;
    }

    setSetupLoading(true);
    try {
      const response = await api.createVaultSetupToken(token);
      const link = response.paypal_response?.payer_vault_setup_approval_link;
      const id = response.paypal_response?.vault_setup_token_id;

      if (link && id) {
        setApprovalLink(link);
        setSetupTokenId(id);
        sessionStorage.setItem("penny_vault_setup_token_id", id);

        // Open PayPal page for user to approve faster payments
        window.open(link, "_blank", "noopener,noreferrer");
        onNotify(
          "PayPal approval window opened. Once approved, click 'Complete Activation' below.",
          "info",
        );
      } else {
        onNotify(
          "Could not retrieve PayPal vault setup link from API.",
          "error",
        );
      }
    } catch (err: unknown) {
      onNotify(
        err instanceof Error
          ? err.message
          : "Failed to generate vault setup token.",
        "error",
      );
    } finally {
      setSetupLoading(false);
    }
  }

  // Step 2: Pass setup_token_id to POST /vault/setup-token-exchange in request body
  async function handleExchangeToken() {
    const tokenToExchange =
      setupTokenId.trim() ||
      sessionStorage.getItem("penny_vault_setup_token_id");
    if (!tokenToExchange) {
      onNotify(
        "No setup token found. Please click 'Setup Buy for me' first.",
        "error",
      );
      return;
    }

    setExchangeLoading(true);
    try {
      await api.exchangeVaultSetupToken(tokenToExchange, token);

      // Refresh vault token state from backend
      const nextVault = await api.getVault(token);
      setVaultToken(nextVault);

      // Switch mode to buy-for-me
      setActiveMode("buy-for-me");
      sessionStorage.setItem("penny_mode", "buy-for-me");
      sessionStorage.removeItem("penny_vault_setup_token_id");
      setApprovalLink(null);
      setSetupTokenId("");

      onNotify(
        "Switched from 'Shop for me' to 'Buy for me'! Autonomous checkout is now active.",
        "success",
      );
    } catch (err: unknown) {
      onNotify(
        err instanceof Error
          ? err.message
          : "Failed to exchange setup token for vault payment token.",
        "error",
      );
    } finally {
      setExchangeLoading(false);
    }
  }

  // Step 3: Delete vault token via DELETE /vault/own
  async function handleDeleteVaultToken() {
    if (
      !window.confirm(
        "Are you sure you want to delete your saved PayPal payment token? This will switch Penny back to 'Shop for me' mode.",
      )
    ) {
      return;
    }

    setDeleteLoading(true);
    try {
      await api.deleteVault(token);
      setVaultToken(null);

      // Switch mode back to shop-with-me (Shop for me)
      setActiveMode("shop-with-me");
      sessionStorage.setItem("penny_mode", "shop-with-me");
      sessionStorage.removeItem("penny_vault_setup_token_id");
      setApprovalLink(null);
      setSetupTokenId("");

      onNotify(
        "PayPal vault token deleted. Switched back to 'Shop for me' mode.",
        "success",
      );
    } catch (err: unknown) {
      onNotify(
        err instanceof Error ? err.message : "Failed to delete vault token.",
        "error",
      );
    } finally {
      setDeleteLoading(false);
    }
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
          <p className="overline">VAULT MANAGEMENT &amp; MODES</p>
          <h1>Penny Commerce Modes</h1>
          <p>
            By default, Penny is set to <strong>Shop for me</strong> (manual
            approval). Set up <strong>Buy for me</strong> to authorize
            autonomous checkout using your tokenized PayPal Vault.
          </p>
        </div>
      </div>

      <div className="payment-shell">
        <section className="payment-main">
          {/* Mode Status Pill */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 8,
              border: "1px solid #dcdfd8",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <div>
              <span
                style={{
                  font: "700 8px 'DM Mono', monospace",
                  color: activeMode === "buy-for-me" ? "#1d583c" : "#7d8a83",
                  background:
                    activeMode === "buy-for-me" ? "#e0ece4" : "#f1f2ee",
                  padding: "3px 6px",
                  borderRadius: 4,
                  display: "inline-block",
                  marginBottom: 4,
                }}
              >
                CURRENT ACTIVE MODE
              </span>
              <h3 style={{ margin: 0, fontSize: 16 }}>
                {activeMode === "buy-for-me"
                  ? "Buy for me (Autonomous Mode)"
                  : "Shop for me (Manual Checkout — Default)"}
              </h3>
            </div>

            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background:
                  activeMode === "buy-for-me"
                    ? "var(--penny-green)"
                    : "#e2b842",
                boxShadow:
                  activeMode === "buy-for-me"
                    ? "0 0 0 4px var(--penny-green-soft)"
                    : "0 0 0 4px #faeed3",
              }}
            />
          </div>

          {loading ? (
            <div
              style={{ padding: "40px 0", textAlign: "center", color: "#667" }}
            >
              <span className="button-spinner" /> Checking PayPal Vault
              authorization...
            </div>
          ) : vaultToken ? (
            /* ACTIVE VAULT TOKEN (BUY FOR ME IS ACTIVE) */
            <div className="autonomy-dashboard">
              <header>
                <div>
                  <span className="automation-pulse" />
                  <span>
                    <strong>Buy for me Mode: Active</strong>
                  </span>
                </div>
                <b>TOKENIZED</b>
              </header>

              <div className="automation-limit">
                <span>
                  <small>AUTONOMOUS SETTLEMENT STATUS</small>
                  <strong>Active</strong>
                  {/* <em>Penny will settle orders autonomously</em> */}
                </span>
                <span style={{ fontSize: "10px", color: "var(--penny-green)" }}>
                  Verified &bull; Non-Custodial
                </span>
              </div>

              <div className="automation-rules">
                <div>
                  <em>1</em>
                  <span>
                    <strong>Auto-Create &amp; Settle</strong>
                    <small>
                      Penny creates and captures approved orders on your behalf
                    </small>
                  </span>
                  <b>ENABLED</b>
                </div>
                <div>
                  <em>2</em>
                  <span>
                    <strong>Buyer Protection Included</strong>
                    <small>
                      Standard PayPal Purchase Protection covers all settlements
                    </small>
                  </span>
                  <b>ACTIVE</b>
                </div>
                <div>
                  <em>3</em>
                  <span>
                    <strong>Instant Token Revocation</strong>
                    <small>
                      Delete token anytime to immediately return to Shop for me
                    </small>
                  </span>
                  <b>AVAILABLE</b>
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
                        strokeWidth="2"
                      />
                    </svg>
                  </span>
                  <span>
                    <strong>Switch back to Shop for me</strong>
                  </span>
                </div>

                <button
                  disabled={deleteLoading}
                  onClick={handleDeleteVaultToken}
                  style={{
                    padding: "8px 14px",
                    border: "1px solid #d9534f",
                    borderRadius: "6px",
                    color: "#d9534f",
                    background: "#ffffff",
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {deleteLoading ? "Deleting Token..." : "Delete Vault Token"}
                </button>
              </footer>
            </div>
          ) : (
            /* NO VAULT TOKEN: SETUP FLOW TO SWITCH FROM SHOP FOR ME TO BUY FOR ME */
            <div className="handoff-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
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
                  <img
                    src={paypalLogo}
                    alt="PayPal"
                    className="paypal-btn-img"
                  />
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>
                    Switch from &ldquo;Shop for me&rdquo; to &ldquo;Buy for
                    me&rdquo;
                  </h3>
                  <small style={{ color: "#77817c" }}>
                    Authorize a PayPal Vault Setup Token to enable autonomous
                    payments
                  </small>
                </div>
              </div>

              <p style={{ fontSize: 11, color: "#66736d", lineHeight: 1.6 }}>
                Currently in <strong>Shop for me</strong> mode (default). Penny
                asks you to review and approve every checkout on the PayPal
                screen. To enable <strong>Buy for me</strong>:
              </p>

              <ol
                style={{
                  fontSize: 11,
                  color: "#54645d",
                  paddingLeft: 18,
                  lineHeight: 1.7,
                  margin: "10px 0 16px",
                }}
              >
                <li>
                  Call the setup token endpoint to generate a PayPal vault
                  approval link.
                </li>
                <li>Approve faster payments on the PayPal sandbox window.</li>
                <li>
                  Exchange the setup token to activate autonomous settlement.
                </li>
              </ol>

              {!approvalLink && !setupTokenId ? (
                <button
                  className="paypal-button"
                  disabled={setupLoading}
                  onClick={handleStartSetup}
                  style={{ marginTop: 8 }}
                >
                  <img
                    src={paypalLogo}
                    alt="PayPal"
                    className="paypal-btn-img"
                  />
                  <span>
                    {setupLoading
                      ? "Generating Vault Setup Token..."
                      : "Setup Buy for me (Generate Setup Token)"}
                  </span>
                </button>
              ) : (
                <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
                  {/* Step A: PayPal Approval Window */}
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 6,
                      border: "1px solid #d9e2db",
                      background: "#f8faf8",
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 700, color: "#365c49" }}>
                      Step 1: Approve Faster Payment on PayPal
                    </p>
                    <p
                      style={{
                        margin: "6px 0 10px",
                        fontSize: 10,
                        color: "#69756f",
                      }}
                    >
                      The PayPal window was opened. If blocked by your browser,
                      open it directly:
                    </p>
                    {approvalLink && (
                      <a
                        className="primary-action"
                        href={approvalLink}
                        rel="noopener noreferrer"
                        style={{
                          textAlign: "center",
                          textDecoration: "none",
                          display: "inline-block",
                        }}
                        target="_blank"
                      >
                        Open PayPal Vault Approval Link &rarr;
                      </a>
                    )}
                  </div>

                  {/* Step B: Exchange Setup Token */}
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 6,
                      border: "1px solid #d9e2db",
                      background: "#f8faf8",
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 700, color: "#365c49" }}>
                      Step 2: Complete Setup Token Exchange
                    </p>
                    <p
                      style={{
                        margin: "6px 0 10px",
                        fontSize: 10,
                        color: "#69756f",
                      }}
                    >
                      Once approved on PayPal, click below to exchange your
                      setup token for the persistent payment token.
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9,
                          font: "700 8px 'DM Mono'",
                          color: "#77857d",
                        }}
                      >
                        SETUP TOKEN ID:
                      </span>
                      <code
                        style={{
                          background: "#ffffff",
                          padding: "4px 8px",
                          border: "1px solid #d4ddd5",
                          borderRadius: 4,
                          fontSize: 10,
                          fontFamily: "monospace",
                          color: "#273a30",
                        }}
                      >
                        {setupTokenId || "Pending generation..."}
                      </code>
                    </div>

                    <button
                      className="primary-action"
                      disabled={exchangeLoading}
                      onClick={handleExchangeToken}
                    >
                      {exchangeLoading
                        ? "Exchanging Setup Token with Penny API..."
                        : "I've Approved on PayPal — Complete Activation & Switch to Buy for me"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* SIDEBAR EXPLANATION */}
        <aside className="payment-summary">
          <div className="summary-title">
            <span>MODE COMPARISON</span>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div
              style={{
                padding: 12,
                borderRadius: 6,
                border: "1px solid #d9e2db",
                background:
                  activeMode === "shop-with-me" ? "#fffcf4" : "#ffffff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <strong style={{ fontSize: 11 }}>Shop for me</strong>
                <span
                  style={{
                    fontSize: 8,
                    font: "700 7px 'DM Mono'",
                    color: "#77857d",
                  }}
                >
                  DEFAULT
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 9,
                  color: "#697770",
                  lineHeight: 1.5,
                }}
              >
                Penny compiles recommendations and creates a PayPal order. You
                review the total and log in to PayPal to complete checkout
                manually.
              </p>
            </div>

            <div
              style={{
                padding: 12,
                borderRadius: 6,
                border: "1px solid #d9e2db",
                background: activeMode === "buy-for-me" ? "#fffcf4" : "#ffffff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <strong style={{ fontSize: 11 }}>Buy for me</strong>
                <span
                  style={{
                    fontSize: 8,
                    font: "700 7px 'DM Mono'",
                    color: "var(--penny-green)",
                  }}
                >
                  AUTONOMOUS
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 9,
                  color: "#697770",
                  lineHeight: 1.5,
                }}
              >
                With your PayPal Vault setup token exchanged, Penny uses the
                saved non-custodial token to auto-capture payments when you
                confirm an order in chat.
              </p>
            </div>
          </div>

          <button
            className="continue-button"
            onClick={() => onNavigate("chat")}
            style={{ marginTop: 22 }}
          >
            Return to Shopping &rarr;
          </button>
        </aside>
      </div>
    </main>
  );
}
