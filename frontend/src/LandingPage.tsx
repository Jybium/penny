import { useState, type ReactNode, type FormEvent } from "react";
import type { AuthUser } from "./AuthModal";

type Props = {
  user: AuthUser | null;
  mode: "shop-with-me" | "buy-for-me";
  onModeChange: (mode: "shop-with-me" | "buy-for-me") => void;
  onEnter: (query?: string) => void;
  onSignIn: () => void;
  onSignUp: () => void;
  onOpenDemo: () => void;
};

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
  );
}

const Arrow = () => (
  <Mark>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Mark>
);
const Sparkles = () => (
  <Mark>
    <path d="m12 3 1.2 3.3L16.5 8l-3.3 1.2L12 12.5l-1.2-3.3L7.5 8l3.3-1.7L12 3ZM18 14l.7 1.7 1.8.8-1.8.7L18 19l-.7-1.8-1.8-.7 1.8-.8L18 14Z" />
  </Mark>
);
const Shield = () => (
  <Mark>
    <path d="M12 3 5 6v5c0 4.8 3 8.1 7 10 4-1.9 7-5.2 7-10V6l-7-3Z" />
  </Mark>
);
const Check = () => (
  <Mark>
    <path d="m5 12 4 4L19 7" />
  </Mark>
);
const Person = () => (
  <Mark>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Mark>
);
const Lock = () => (
  <Mark>
    <rect height="10" rx="2" width="14" x="5" y="10" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Mark>
);
const Card = () => (
  <Mark>
    <rect height="14" rx="2" width="18" x="3" y="5" />
    <path d="M3 10h18" />
  </Mark>
);

const SAMPLE_PROMPTS = [
  "Find me wireless noise cancelling headphones under $150",
  "Ergonomic mechanical keyboard for typing",
  "Adjustable standing desk converter",
];

export default function LandingPage({
  user,
  mode,
  onModeChange,
  onEnter,
  onSignIn,
  onSignUp,
  onOpenDemo,
}: Props) {
  const [heroSearch, setHeroSearch] = useState("");

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    onEnter(heroSearch.trim() || undefined);
  }

  return (
    <main className="landing-page">
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
                <img src="/penny-logo.png" alt="Penny Logo" className="penny-logo-mark" />
              </span>
              <div>
                <strong>Your commerce agent</strong>
                <small>
                  Multimodal Search &bull; LangGraph &bull; PayPal Ready
                </small>
              </div>
              <span className="online-tag">
                <span className="online-beacon" />
                ONLINE
              </span>
            </header>
            <div className="landing-demo-body">
              <div className="demo-welcome">
                <span className="demo-welcome-avatar">
                  <img src="/penny-logo.png" alt="Penny Logo" className="penny-logo-mark" />
                </span>
                <strong>What should Penny find?</strong>
                <p>
                  Describe what you need or pick a sample product search below.
                </p>
              </div>

              {/* Interactive Search Input on Landing Hero */}
              <form
                onSubmit={handleSearchSubmit}
                style={{ display: "grid", gap: 8, margin: "10px 0" }}
              >
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
                      className="demo-sample-prompt"
                      key={prompt}
                      onClick={() => onEnter(prompt)}
                      type="button"
                    >
                      &ldquo;{prompt}&rdquo;
                    </button>
                  ))}
                </div>

                <button
                  className="demo-search-submit"
                  title="Search with Penny"
                  type="submit"
                >
                  <span className="text-black ">Search with Penny</span>
                  <Arrow />
                </button>
              </form>

              {/* Visual Curated Discovery Strip */}
              <div className="hero-product-showcase">
                <span className="hero-showcase-label">
                  POPULAR AGENT SEARCHES
                </span>
                <div className="hero-product-pills">
                  <button
                    className="hero-product-pill"
                    onClick={() =>
                      onEnter(
                        "Find wireless noise cancelling headphones under $150",
                      )
                    }
                    type="button"
                  >
                    <img
                      alt="Sony Headphones"
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=120&q=80"
                    />
                    <div>
                      <strong>Sony WH-1000XM5</strong>
                      <small>$148 &bull; 4.8 ★</small>
                    </div>
                  </button>
                  <button
                    className="hero-product-pill"
                    onClick={() =>
                      onEnter("Ergonomic mechanical keyboard for typing")
                    }
                    type="button"
                  >
                    <img
                      alt="Mechanical Keyboard"
                      src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=120&q=80"
                    />
                    <div>
                      <strong>Keychron K2</strong>
                      <small>$89 &bull; 4.9 ★</small>
                    </div>
                  </button>
                  <button
                    className="hero-product-pill"
                    onClick={() =>
                      onEnter("Running shoes with high arch support")
                    }
                    type="button"
                  >
                    <img
                      alt="Running Shoes"
                      src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=120&q=80"
                    />
                    <div>
                      <strong>Nike Pegasus 40</strong>
                      <small>$124 &bull; 4.7 ★</small>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Floating Mode Cards Synced with Mode State */}
          <button
            className={`float-card guardrail ${mode === "shop-with-me" ? "is-selected" : ""}`}
            onClick={() => onModeChange("shop-with-me")}
            type="button"
          >
            <Shield />
            <span>
              <strong>
                Shop with me
                {mode === "shop-with-me" && (
                  <span className="float-card-active-pill">ACTIVE</span>
                )}
              </strong>
              You complete PayPal checkout
            </span>
          </button>

          <button
            className={`float-card savings ${mode === "buy-for-me" ? "is-selected" : ""}`}
            onClick={() => onModeChange("buy-for-me")}
            type="button"
          >
            <Sparkles />
            <span>
              <strong>
                Buy for me
                {mode === "buy-for-me" && (
                  <span className="float-card-active-pill">ACTIVE</span>
                )}
              </strong>
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
            Penny handles the searching and comparing. You keep the judgment and
            the final say.
          </span>
        </div>
        <div className="landing-how-grid">
          <article>
            <div className="landing-how-img-wrap">
              <img
                alt="Shopper querying commerce assistant"
                loading="lazy"
                src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80"
              />
              <span className="landing-how-badge">
                01 &bull; Natural Intent
              </span>
            </div>
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
            <div className="landing-how-img-wrap">
              <img
                alt="Live merchant search and product comparison"
                loading="lazy"
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
              />
              <span className="landing-how-badge">
                02 &bull; Agent Synthesis
              </span>
            </div>
            <b>02</b>
            <i>
              <Sparkles />
            </i>
            <h3>Your agent does the work</h3>
            <p>
              It queries verified merchant catalogs, compares specs, and returns
              live product cards with stock status and prices.
            </p>
          </article>
          <article>
            <div className="landing-how-img-wrap">
              <img
                alt="Instant secure PayPal checkout"
                loading="lazy"
                src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=600&q=80"
              />
              <span className="landing-how-badge">
                03 &bull; Guarded Settlement
              </span>
            </div>
            <b>03</b>
            <i>
              <Check />
            </i>
            <h3>You make the call</h3>
            <p>
              Review curated recommendations, approve checkout with PayPal, or
              let Penny capture automatically in Buy for me mode.
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
              <img
                src="/paypal.png"
                alt="PayPal"
                style={{ height: 14, width: "auto", objectFit: "contain" }}
              />
              PayPal Sandbox protection on all test transactions
            </li>
          </ul>
        </div>

        {/* Live Synchronized Control Panel */}
        <div className="control-panel rounded-lg">
          <header>
            <span>
              <Shield /> Penny mode
            </span>
            <i>
              ACTIVE: {mode === "buy-for-me" ? "BUY FOR ME" : "SHOP WITH ME"}
            </i>
          </header>
          <div
            className={`control-mode-option ${mode === "shop-with-me" ? "is-selected" : ""}`}
            onClick={() => onModeChange("shop-with-me")}
          >
            <span>
              <strong>Shop with me (Default)</strong>
              <small>
                Penny creates the order; you review and complete PayPal
                checkout.
              </small>
            </span>
            <b className="whitespace-nowrap ml-3">
              {mode === "shop-with-me" ? "SELECTED" : "CLICK TO SELECT"}
            </b>
          </div>
          <div
            className={`control-mode-option ${mode === "buy-for-me" ? "is-selected" : ""}`}
            onClick={() => onModeChange("buy-for-me")}
          >
            <span>
              <strong>Buy for me (Autonomous)</strong>
              <small>
                Penny settles orders automatically with your saved PayPal Vault
                token.
              </small>
            </span>
            <b className="whitespace-nowrap ml-3">
              {mode === "buy-for-me" ? "SELECTED" : "CLICK TO SELECT"}
            </b>
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
            Use <strong>Shop with me</strong> when you want to review and
            authorize each checkout manually. Switch to{" "}
            <strong>Buy for me</strong> when you want Penny to handle checkout
            seamlessly using your tokenized PayPal Vault.
          </p>
          <div className="penny-modes">
            <div
              onClick={() => onModeChange("shop-with-me")}
              style={{
                cursor: "pointer",
                border:
                  mode === "shop-with-me"
                    ? "2px solid var(--penny-green)"
                    : "1px solid #dce2dc",
                background: mode === "shop-with-me" ? "#ffffff" : "#fbfdfc",
              }}
            >
              <span>01</span>
              <strong>Shop with me {mode === "shop-with-me" && "✓"}</strong>
              <small>
                You manually complete checkout on the PayPal screen.
              </small>
            </div>
            <div
              onClick={() => onModeChange("buy-for-me")}
              style={{
                cursor: "pointer",
                border:
                  mode === "buy-for-me"
                    ? "2px solid var(--penny-green)"
                    : "1px solid #dce2dc",
                background: mode === "buy-for-me" ? "#ffffff" : "#fbfdfc",
              }}
            >
              <span>02</span>
              <strong>Buy for me {mode === "buy-for-me" && "✓"}</strong>
              <small>
                Penny completes checkout with your saved PayPal Vault.
              </small>
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
                Penny streams real-time updates and records completed orders
              </span>
            </li>
          </ul>
          <button onClick={() => (user ? onEnter() : onSignUp())}>
            {user ? "Open Autonomous Settings" : "Set up autonomous payments"}{" "}
            <Arrow />
          </button>
        </div>

        {/* Live Autonomous Protection Dashboard Filler */}
        <div className="autonomy-dashboard">
          <header>
            <div>
              <span className="automation-pulse" />
              <img
                src="/paypal.png"
                alt="PayPal"
                className="landing-paypal-badge-img"
              />
              <span>
                <strong>Autonomous Checkout Engine</strong>
              </span>
            </div>
          </header>

          <div className="automation-limit">
            <span>
              <small>SPENDING GUARDRAIL</small>
              <strong>$250</strong>
              <em>/ order cap</em>
            </span>
            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: "#1f5f3e",
                  background: "#d9f0e1",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  display: "inline-block",
                  letterSpacing: "0.04em",
                }}
              >
                ● AUTO-CAPTURE READY
              </span>
            </div>
          </div>

          <div className="automation-rules">
            <div>
              <em>01</em>
              <span>
                <strong>Explicit Price Ceiling</strong>
                <small>Orders above cap require manual confirmation</small>
              </span>
              <b>ENFORCED</b>
            </div>
            <div>
              <em>02</em>
              <span>
                <strong>Non-Custodial Token</strong>
                <small>Penny never stores your raw card credentials</small>
              </span>
              <b>VERIFIED</b>
            </div>
            <div>
              <em>03</em>
              <span>
                <strong>Instant Revocation</strong>
                <small>Disconnect vault token anytime in one click</small>
              </span>
              <b>ACTIVE</b>
            </div>
          </div>

          <footer>
            <div className="automation-check">
              <Check />
            </div>
            <span>
              <strong>Guaranteed User Control</strong>
              <small>
                Penny acts strictly within your pre-authorized limits
              </small>
            </span>
          </footer>
        </div>
      </section>

      {/* Landing Footer */}
      <footer className="landing-footer-main">
        <div className="landing-footer-top">
          <div className="footer-brand-col">
            <button
              className="wordmark footer-wordmark"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              type="button"
            >
              <span className="wordmark-icon">
                <img
                  alt="Penny Logo"
                  className="penny-logo-mark"
                  src="/penny-logo.png"
                />
              </span>
              <span>Penny</span>
            </button>
            <p className="footer-tagline">
              Agentic commerce with human judgment. Multimodal search, live
              merchant verification, and non-custodial PayPal order settlement.
            </p>
            <div className="footer-status-pill">
              <span className="online-beacon" />
              <span>LIVE AGENT SYSTEM &bull; ONLINE</span>
            </div>
          </div>

          <div className="footer-links-col">
            <strong>Architecture</strong>
            <a href="#how">Intent to Purchase</a>
            <a href="#control">Your Control &amp; Consent</a>
            <a href="#autonomy">Autonomous Modes</a>
            <button
              className="footer-link-btn"
              onClick={onOpenDemo}
              type="button"
            >
              Interactive Architecture Demo &rarr;
            </button>
          </div>

          <div className="footer-links-col">
            <strong>Safety &amp; Privacy</strong>
            <span>Non-Custodial Tokenization</span>
            <span>Zero Stored Card Data</span>
            <span>PayPal Sandbox Protection</span>
            <span>Live Merchant Inventory Only</span>
          </div>

          <div className="footer-cta-col">
            <strong>Start Shopping</strong>
            <p>
              Experience seamless conversational commerce powered by live
              catalog search and PayPal.
            </p>
            <button
              className="footer-start-btn"
              onClick={() => onEnter()}
              type="button"
            >
              <span>{user ? "Continue to Chat" : "Try Penny Now"}</span>
              <Arrow />
            </button>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Penny. Agentic Commerce Platform.</p>
          <div className="footer-badges">
            <span className="footer-partner-badge">
              <img
                alt="PayPal"
                className="footer-paypal-img"
                src="/paypal.png"
              />
              <span>PayPal Verified Checkout</span>
            </span>
          </div>
          <button
            className="footer-back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            type="button"
          >
            Back to top &uarr;
          </button>
        </div>
      </footer>
    </main>
  );
}
