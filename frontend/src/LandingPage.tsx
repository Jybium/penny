import { useState, type ReactNode, type FormEvent } from "react"
import type { AuthUser } from "./AuthModal"

type Props = {
  user: AuthUser | null
  mode: "shop-with-me" | "buy-for-me"
  onModeChange: (mode: "shop-with-me" | "buy-for-me") => void
  onEnter: (query?: string) => void
  onSignIn: () => void
  onSignUp: () => void
  onOpenDemo: () => void
}

function Mark({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      viewBox="0 0 24 24"
      width="18"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      >
        {children}
      </g>
    </svg>
  )
}

const Arrow = () => (
  <Mark>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Mark>
)
const Sparkles = () => (
  <Mark>
    <path d="m12 3 1.2 3.3L16.5 8l-3.3 1.2L12 12.5l-1.2-3.3L7.5 8l3.3-1.7L12 3ZM18 14l.7 1.7 1.8.8-1.8.7L18 19l-.7-1.8-1.8-.7 1.8-.8L18 14Z" />
  </Mark>
)
const Shield = () => (
  <Mark>
    <path d="M12 3 5 6v5c0 4.8 3 8.1 7 10 4-1.9 7-5.2 7-10V6l-7-3Z" />
  </Mark>
)
const Check = () => (
  <Mark>
    <path d="m5 12 4 4L19 7" />
  </Mark>
)
const Person = () => (
  <Mark>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Mark>
)
const Lock = () => (
  <Mark>
    <rect height="10" rx="2" width="14" x="5" y="10" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Mark>
)
const Card = () => (
  <Mark>
    <rect height="14" rx="2" width="18" x="3" y="5" />
    <path d="M3 10h18" />
  </Mark>
)

const SAMPLE_PROMPTS = [
  "Find me wireless noise cancelling headphones under $150",
  "Ergonomic mechanical keyboard for typing",
  "Adjustable standing desk converter",
]

export default function LandingPage({
  user,
  mode,
  onModeChange,
  onEnter,
  onSignIn,
  onSignUp,
  onOpenDemo,
}: Props) {
  const [heroSearch, setHeroSearch] = useState("")

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault()
    onEnter(heroSearch.trim() || undefined)
  }

  return (
    <main className="landing-page">
      {/* Synchronized Landing Navigation with Logo, Anchors, and Auth Buttons */}
      <nav className="landing-nav">
        <button
          className="landing-brand"
          onClick={() => (user ? onEnter() : window.scrollTo({ top: 0, behavior: "smooth" }))}
          title="Penny Commerce Agent"
          type="button"
        >
          <span>
            <Sparkles />
          </span>
          Penny
        </button>

        <div className="landing-links">
          <a href="#how">How it works</a>
          <a href="#control">Your control</a>
          <a href="#autonomy">Autonomous payments</a>
          <button
            className="demo-trigger-button"
            onClick={onOpenDemo}
            style={{
              padding: "4px 8px",
              fontSize: 9,
              gap: 4,
            }}
            title="Open Interactive System Demo"
            type="button"
          >
            <span className="demo-trigger-pill">DEMO</span>
            <span>How it Works</span>
            <Sparkles />
          </button>
        </div>

        <div className="landing-account-actions">
          {user ? (
            <>
              <button
                onClick={() => onEnter()}
                style={{
                  background: "var(--penny-green)",
                  color: "#ffffff",
                  padding: "9px 14px",
                  borderRadius: 6,
                  border: "none",
                  fontWeight: 700,
                  fontSize: 10,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
                title="Enter Penny Conversation"
                type="button"
              >
                Go to Chat <Arrow />
              </button>
              <button
                className="profile-button"
                onClick={() => onEnter()}
                style={{ cursor: "pointer" }}
                title={`${user.email} (Signed in)`}
                type="button"
              >
                {`${user.firstName[0] || ""}${user.lastName[0] || ""}`.toUpperCase()}
              </button>
            </>
          ) : (
            <>
              <button onClick={onSignIn} type="button">
                Sign in
              </button>
              <button className="landing-nav-cta" onClick={onSignUp} type="button">
                Get started <Arrow />
              </button>
            </>
          )}
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-copy">
          <p className="landing-label">
            <i /> AGENTIC COMMERCE, WITH YOU IN CONTROL
          </p>
          <h1>
            Stop shopping.
            <br />
            Start <em>deciding.</em>
          </h1>
          <p className="landing-lead">
            Tell your AI agent what you need. It researches the market, compares
            the tradeoffs, and brings you one clear decision—ready to approve.
          </p>
          <div className="landing-actions">
            <button onClick={() => onEnter(heroSearch.trim() || undefined)}>
              {user ? "Continue to Chat" : "Start a purchase"} <Arrow />
            </button>
            <button
              onClick={onOpenDemo}
              style={{
                background: "none",
                border: "1px solid #d0d7d0",
                borderRadius: 8,
                padding: "10px 16px",
                color: "#304339",
                fontWeight: 600,
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              How Penny Works Demo
            </button>
          </div>
          <div className="landing-proof">
            <div>
              <span>{user ? user.firstName[0] : "AM"}</span>
              <span>JL</span>
              <span>SK</span>
            </div>
            <p>
              <strong>Designed for control</strong>
              You choose between manual review and autonomous vault settlement
            </p>
          </div>
        </div>

        <div className="landing-demo-wrap">
          <div className="landing-demo">
            <header>
              <span className="demo-agent">
                <Sparkles />
              </span>
              <div>
                <strong>Your commerce agent</strong>
                <small>Multimodal Search &bull; LangGraph &bull; PayPal Ready</small>
              </div>
              <i style={{ font: "700 8px 'DM Mono'", background: "#def0e5", color: "#175837", padding: "2px 6px", borderRadius: 4 }}>
                ONLINE
              </i>
            </header>
            <div className="landing-demo-body">
              <div className="demo-welcome">
                <span>
                  <Sparkles />
                </span>
                <strong>What should Penny find?</strong>
                <p>
                  Describe what you need or pick a sample product search below.
                </p>
              </div>

              {/* Interactive Search Input on Landing Hero */}
              <form onSubmit={handleSearchSubmit} style={{ display: "grid", gap: 8, margin: "10px 0" }}>
                <input
                  aria-label="Describe what you want to buy"
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="e.g. Wireless noise cancelling headphones under $150..."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #d2ded5",
                    fontSize: 11,
                    outline: "none",
                    background: "#ffffff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  }}
                  type="text"
                  value={heroSearch}
                />

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {SAMPLE_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => onEnter(prompt)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #dbe2dc",
                        background: "#f4f7f5",
                        fontSize: 9,
                        color: "#465c51",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                      type="button"
                    >
                      &ldquo;{prompt}&rdquo;
                    </button>
                  ))}
                </div>

                <button style={{ marginTop: 4 }} type="submit">
                  Search with Penny <Arrow />
                </button>
              </form>
            </div>
          </div>

          {/* Interactive Floating Mode Cards Synced with Mode State */}
          <button
            className={`float-card guardrail ${mode === "shop-with-me" ? "is-selected" : ""}`}
            onClick={() => onModeChange("shop-with-me")}
            style={{
              cursor: "pointer",
              textAlign: "left",
              border: mode === "shop-with-me" ? "2px solid var(--penny-green)" : "1px solid #dce0d9",
              background: mode === "shop-with-me" ? "#fffcf5" : "#ffffff",
            }}
            type="button"
          >
            <Shield />
            <span>
              <strong>Shop with me {mode === "shop-with-me" ? "✓ (ACTIVE)" : ""}</strong>
              You complete PayPal checkout
            </span>
          </button>

          <button
            className={`float-card savings ${mode === "buy-for-me" ? "is-selected" : ""}`}
            onClick={() => onModeChange("buy-for-me")}
            style={{
              cursor: "pointer",
              textAlign: "left",
              border: mode === "buy-for-me" ? "2px solid var(--penny-green)" : "1px solid #dce0d9",
              background: mode === "buy-for-me" ? "#fffcf5" : "#ffffff",
            }}
            type="button"
          >
            <Check />
            <span>
              <strong>Buy for me {mode === "buy-for-me" ? "✓ (ACTIVE)" : ""}</strong>
              Penny completes checkout autonomously
            </span>
          </button>
        </div>
      </section>

      <section className="landing-trust">
        <span>YOUR AGENT CHECKS</span>
        <div>
          {[
            "Trusted retailers",
            "Verified reviews",
            "Return policies",
            "Real delivery times",
            "Best available price",
          ].map((item) => (
            <p key={item}>
              <Check /> {item}
            </p>
          ))}
        </div>
      </section>

      <section className="landing-how" id="how">
        <div className="landing-section-heading">
          <p>FROM INTENT TO PURCHASE</p>
          <h2>
            One conversation.
            <br />
            One confident decision.
          </h2>
          <span>
            Penny handles the searching and comparing. You keep the
            judgment and the final say.
          </span>
        </div>
        <div className="landing-how-grid">
          <article>
            <b>01</b>
            <i>
              <Person />
            </i>
            <h3>Say what you need</h3>
            <p>
              Describe your goal, budget, timing, or upload a product picture.
              No complex search filters or 20 tabs open.
            </p>
          </article>
          <article>
            <b>02</b>
            <i>
              <Sparkles />
            </i>
            <h3>Your agent does the work</h3>
            <p>
              It queries verified merchant catalogs, compares specs, and
              returns live product cards with stock status and prices.
            </p>
          </article>
          <article>
            <b>03</b>
            <i>
              <Check />
            </i>
            <h3>You make the call</h3>
            <p>
              Review curated recommendations, approve checkout with PayPal,
              or let Penny capture automatically in Buy for me mode.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-control" id="control">
        <div className="control-copy">
          <p>BUILT AROUND CONSENT</p>
          <h2>
            Your agent works for you.
            <br />
            It doesn’t decide for you.
          </h2>
          <span>
            Every purchase starts with your intent and follows the Penny mode
            you choose. Penny only changes who completes checkout; the purchase
            itself stays visible to you.
          </span>
          <ul>
            <li>
              <Lock /> Non-custodial — zero stored card credentials
            </li>
            <li>
              <Shield /> Full transparency on reasoning and merchant pricing
            </li>
            <li>
              <Card /> PayPal Sandbox protection on all test transactions
            </li>
          </ul>
        </div>

        {/* Live Synchronized Control Panel */}
        <div className="control-panel">
          <header>
            <span>
              <Shield /> Penny mode
            </span>
            <i>ACTIVE: {mode === "buy-for-me" ? "BUY FOR ME" : "SHOP WITH ME"}</i>
          </header>
          <div
            onClick={() => onModeChange("shop-with-me")}
            style={{
              cursor: "pointer",
              background: mode === "shop-with-me" ? "#eef6f1" : "transparent",
              transition: "background 0.15s ease",
            }}
          >
            <span>
              <strong>Shop with me (Default)</strong>
              <small>Penny creates the order; you review and complete PayPal checkout.</small>
            </span>
            <b>{mode === "shop-with-me" ? "SELECTED" : "CLICK TO SELECT"}</b>
          </div>
          <div
            onClick={() => onModeChange("buy-for-me")}
            style={{
              cursor: "pointer",
              background: mode === "buy-for-me" ? "#eef6f1" : "transparent",
              transition: "background 0.15s ease",
            }}
          >
            <span>
              <strong>Buy for me (Autonomous)</strong>
              <small>Penny settles orders automatically with your saved PayPal Vault token.</small>
            </span>
            <b>{mode === "buy-for-me" ? "SELECTED" : "CLICK TO SELECT"}</b>
          </div>
        </div>
      </section>

      <section className="landing-autonomy" id="autonomy">
        <div className="autonomy-copy">
          <b>AVAILABLE NOW</b>
          <h2>
            Two ways to shop.
            <br />
            You choose who checks out.
          </h2>
          <p>
            Use <strong>Shop with me</strong> when you want to review and authorize
            each checkout manually. Switch to <strong>Buy for me</strong> when you want Penny to
            handle checkout seamlessly using your tokenized PayPal Vault.
          </p>
          <div className="penny-modes">
            <div
              onClick={() => onModeChange("shop-with-me")}
              style={{
                cursor: "pointer",
                border: mode === "shop-with-me" ? "2px solid var(--penny-green)" : "1px solid #dce2dc",
                background: mode === "shop-with-me" ? "#ffffff" : "#fbfdfc",
              }}
            >
              <span>01</span>
              <strong>Shop with me {mode === "shop-with-me" && "✓"}</strong>
              <small>You manually complete checkout on the PayPal screen.</small>
            </div>
            <div
              onClick={() => onModeChange("buy-for-me")}
              style={{
                cursor: "pointer",
                border: mode === "buy-for-me" ? "2px solid var(--penny-green)" : "1px solid #dce2dc",
                background: mode === "buy-for-me" ? "#ffffff" : "#fbfdfc",
              }}
            >
              <span>02</span>
              <strong>Buy for me {mode === "buy-for-me" && "✓"}</strong>
              <small>Penny completes checkout with your saved PayPal Vault.</small>
            </div>
          </div>
          <ul>
            <li>
              <Check />
              <span>
                <strong>One clear choice</strong>
                Switch who completes checkout at any time
              </span>
            </li>
            <li>
              <Check />
              <span>
                <strong>PayPal stays in control</strong>
                Your payment details remain securely managed by PayPal
              </span>
            </li>
            <li>
              <Check />
              <span>
                <strong>Live Order Tracking &amp; History</strong>
                Penny streams real-time updates via SSE and records completed orders
              </span>
            </li>
          </ul>
          <button onClick={() => (user ? onEnter() : onSignUp())}>
            {user ? "Open Autonomous Settings" : "Set up autonomous payments"} <Arrow />
          </button>
        </div>
      </section>
    </main>
  )
}
