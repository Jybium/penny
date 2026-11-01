import type { ReactNode } from "react"

type Props = {
  onEnter: () => void
  onSignIn: () => void
  onSignUp: () => void
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
    <rect x="5" y="10" width="14" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Mark>
)
const Card = () => (
  <Mark>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
  </Mark>
)

export default function LandingPage({
  onEnter,
  onSignIn,
  onSignUp,
}: Props) {
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <button className="landing-brand">
          <span>
            <Sparkles />
          </span>
          Penny
        </button>
        <div className="landing-links">
          <a href="#how">How it works</a>
          <a href="#control">Your control</a>
          <a href="#autonomy">Autonomous payments</a>
        </div>
        <div className="landing-account-actions">
          <button onClick={onSignIn}>Sign in</button>
          <button className="landing-nav-cta" onClick={onSignUp}>
            Get started <Arrow />
          </button>
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
            <button onClick={onEnter}>
              Start a purchase <Arrow />
            </button>
            <a href="#how">See how it works</a>
          </div>
          <div className="landing-proof">
            <div>
              <span>AM</span>
              <span>JL</span>
              <span>SK</span>
            </div>
            <p>
              <strong>Designed for control</strong>You choose how checkout works
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
                <small>Researching across the web</small>
              </div>
              <i>LIVE</i>
            </header>
            <div className="landing-demo-body">
              <div className="demo-welcome">
                <span>
                  <Sparkles />
                </span>
                <strong>What should Penny find?</strong>
                <p>
                  Describe what you need or attach a file to search from an
                  image, document, or reference.
                </p>
              </div>
              <div className="demo-file-search">
                <span>+</span>
                <p>
                  <strong>Attach a file</strong>
                  Optional · Penny sends it with your search
                </p>
              </div>
              <button onClick={onEnter}>
                Start a search <Arrow />
              </button>
            </div>
          </div>
          <div className="float-card guardrail">
            <Shield />
            <span>
              <strong>Shop with me</strong>You complete PayPal checkout
            </span>
          </div>
          <div className="float-card savings">
            <Check />
            <span>
              <strong>Buy for me</strong>Penny completes checkout
            </span>
          </div>
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
              Describe your goal, budget, timing, and preferences naturally. No
              filters or endless tabs.
            </p>
          </article>
          <article>
            <b>02</b>
            <i>
              <Sparkles />
            </i>
            <h3>Your agent does the work</h3>
            <p>
              It searches retailers, checks policies, weighs tradeoffs, and
              explains why its pick fits.
            </p>
          </article>
          <article>
            <b>03</b>
            <i>
              <Check />
            </i>
            <h3>You make the call</h3>
            <p>
              Review one clear recommendation, request changes, or approve
              payment securely with PayPal.
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
              <Lock /> Approval before payment
            </li>
            <li>
              <Shield /> Clear reasoning and tradeoffs
            </li>
            <li>
              <Card /> PayPal details stay with PayPal
            </li>
          </ul>
        </div>
        <div className="control-panel">
          <header>
            <span>
              <Shield /> Penny mode
            </span>
            <i>ACTIVE</i>
          </header>
          <div>
            <span>
              <strong>Penny mode</strong>
              <small>Choose who completes checkout</small>
            </span>
            <em>Shop with me</em>
          </div>
          <div>
            <span>
              <strong>Shop with me</strong>
              <small>You complete PayPal checkout</small>
            </span>
            <b>SELECTED</b>
          </div>
          <div>
            <span>
              <strong>Buy for me</strong>
              <small>Penny completes checkout</small>
            </span>
            <em>Available</em>
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
            Use Shop with me when you want to log in and complete PayPal
            checkout yourself. Switch to Buy for me when you want Penny to
            handle checkout with your saved PayPal payment method.
          </p>
          <div className="penny-modes">
            <div>
              <span>01</span>
              <strong>Shop with me</strong>
              <small>You manually complete checkout on the PayPal screen.</small>
            </div>
            <div>
              <span>02</span>
              <strong>Buy for me</strong>
              <small>Penny completes checkout with your saved PayPal.</small>
            </div>
          </div>
          <ul>
            <li>
              <Check />
              <span>
                <strong>One clear choice</strong>
                Switch who completes checkout before you purchase
              </span>
            </li>
            <li>
              <Check />
              <span>
                <strong>PayPal stays in control</strong>
                Your payment method remains stored with PayPal
              </span>
            </li>
            <li>
              <Check />
              <span>
                <strong>See completed orders</strong>
                Penny retrieves your order history from your account
              </span>
            </li>
          </ul>
          <button onClick={onSignUp}>
            Set up autonomous payments <Arrow />
          </button>
        </div>
        <div className="autonomy-dashboard">
          <header>
            <div>
              <span className="automation-pulse" />
              <span>
                <strong>Buy for me</strong>
                <small>Penny handles checkout</small>
              </span>
            </div>
            <b>ACTIVE</b>
          </header>
          <div className="automation-limit mode-status">
            <span>
              <small>CURRENT MODE</small>
              <strong>Buy for me</strong>
              <em>Autonomous checkout</em>
            </span>
            <Check />
          </div>
          <div className="automation-rules">
            <div>
              <Shield />
              <span>
                <strong>PayPal payment method</strong>
                <small>Stored securely with PayPal</small>
              </span>
              <b>READY</b>
            </div>
            <div>
              <Card />
              <span>
                <strong>Checkout handler</strong>
                <small>Penny completes the PayPal checkout</small>
              </span>
              <em>AI</em>
            </div>
          </div>
          <footer>
            <span className="automation-check">
              <Check />
            </span>
            <span>
              <strong>Buy for me is ready</strong>
              <small>You can switch modes before checkout</small>
            </span>
          </footer>
        </div>
      </section>

      <footer className="landing-footer">
        <button className="landing-brand">
          <span>
            <Sparkles />
          </span>
          Penny
        </button>
        <p>Thoughtful commerce, powered by agents.</p>
        <small>© 2025 Penny</small>
      </footer>
    </main>
  )
}
