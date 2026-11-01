import { useEffect, useState } from "react"

type StepId = "search" | "decide" | "settle"

type Props = {
  open: boolean
  onClose: () => void
  onTryQuery?: (query: string) => void
}

export default function DemoModal({ open, onClose, onTryQuery }: Props) {
  const [activeStep, setActiveStep] = useState<StepId>("search")

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  if (!open) return null

  const steps: { id: StepId; number: string; title: string; subtitle: string }[] = [
    {
      id: "search",
      number: "01",
      title: "Natural Query & Multimodal Search",
      subtitle: "Ask in plain language or attach an image",
    },
    {
      id: "decide",
      number: "02",
      title: "Agent Reasoning & Aggregation",
      subtitle: "LangGraph analyzes specs & balances budget",
    },
    {
      id: "settle",
      number: "03",
      title: "Non-Custodial Settlement",
      subtitle: "Shop with me or autonomous Buy for me",
    },
  ]

  return (
    <div className="preferences-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="demo-modal-title"
        aria-modal="true"
        className="preferences-modal demo-modal-panel page-enter"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
      >
        <header className="preferences-header">
          <div>
            <p>INTERACTIVE ARCHITECTURE</p>
            <h2 id="demo-modal-title">How Penny Agentic Commerce Works</h2>
            <span>
              Explore the end-to-end autonomous flow: from multimodal intent recognition
              to non-custodial PayPal order settlement.
            </span>
          </div>
          <button aria-label="Close walkthrough" onClick={onClose}>
            <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
        </header>

        {/* Navigation Tabs */}
        <div className="demo-step-nav">
          {steps.map((step) => (
            <button
              className={`demo-step-tab ${activeStep === step.id ? "is-active" : ""}`}
              key={step.id}
              onClick={() => setActiveStep(step.id)}
            >
              <span className="demo-tab-num">{step.number}</span>
              <div className="demo-tab-text">
                <strong>{step.title}</strong>
                <small>{step.subtitle}</small>
              </div>
            </button>
          ))}
        </div>

        {/* Step 1: Search & Multimodal */}
        {activeStep === "search" && (
          <div className="demo-step-content">
            <div className="demo-visual-card">
              <div className="demo-badge-row">
                <span className="demo-flow-badge">MULTIMODAL INGESTION</span>
                <span className="demo-tech-badge">FASTAPI + CHAT FORM-DATA</span>
              </div>

              <h3>Chat or Upload Product Images</h3>
              <p>
                Penny accepts both text prompts and photo uploads (JPEG, PNG, WEBP).
                When an image is attached, the coordinator extracts visual attributes
                and routes to the multimodal search agent.
              </p>

              <div className="demo-chat-bubble-preview">
                <div className="demo-bubble user-bubble">
                  <div className="demo-image-preview">
                    <span>📷 Attached: marathon-runners.png</span>
                  </div>
                  <p>&ldquo;Find me running shoes like these under $130 with high arch support&rdquo;</p>
                </div>
                <div className="demo-bubble agent-bubble">
                  <div className="demo-sparkle-dot" />
                  <p>
                    Analyzing shoe silhouette, cushioning type, and outsole pattern...
                    Querying live merchant catalog for sub-$130 matches.
                  </p>
                </div>
              </div>

              <div className="demo-action-footer">
                <span>Want to test this live?</span>
                <button
                  className="primary-action"
                  onClick={() => {
                    onClose()
                    onTryQuery?.("Find running shoes like these with arch support under $130")
                  }}
                  style={{ width: "auto", padding: "8px 14px", display: "inline-flex", gap: 8 }}
                >
                  Try Sample Search in Chat &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Agent Reasoning */}
        {activeStep === "decide" && (
          <div className="demo-step-content">
            <div className="demo-visual-card">
              <div className="demo-badge-row">
                <span className="demo-flow-badge">LANGGRAPH AGENT GRAPH</span>
                <span className="demo-tech-badge">INTENT &bull; AGGREGATOR &bull; TOOLS</span>
              </div>

              <h3>Automated Comparison &amp; Order Synthesis</h3>
              <p>
                Unlike generic chat, Penny uses a stateful multi-agent graph:
              </p>

              <div className="demo-pipeline-grid">
                <div className="pipeline-node">
                  <span>Step A</span>
                  <strong>Coordinator Agent</strong>
                  <small>Classifies intent: search, image lookup, or order confirmation.</small>
                </div>
                <div className="pipeline-node">
                  <span>Step B</span>
                  <strong>Product Filter &amp; Search</strong>
                  <small>Applies real price caps, brand parameters, and merchant inventory.</small>
                </div>
                <div className="pipeline-node">
                  <span>Step C</span>
                  <strong>Order Item Aggregator</strong>
                  <small>Synthesizes line items, quantities, and totals with strict currency precision.</small>
                </div>
              </div>

              <div className="demo-quote-box">
                <em>&ldquo;Penny never invents products or hallucinates checkout links. Every item is verified against live e-commerce search tools.&rdquo;</em>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Dual Mode Settlement */}
        {activeStep === "settle" && (
          <div className="demo-step-content">
            <div className="demo-visual-card">
              <div className="demo-badge-row">
                <span className="demo-flow-badge">NON-CUSTODIAL COMMERCE</span>
                <span className="demo-tech-badge">PAYPAL VAULT API &bull; REAL-TIME STREAM</span>
              </div>

              <h3>Two Modes, Complete User Control</h3>
              <p>
                Penny provides two checkout paths based on your preference:
              </p>

              <div className="demo-modes-comparison">
                <div className="mode-box">
                  <div className="mode-box-header">
                    <span className="mode-num">1</span>
                    <strong>Shop with me</strong>
                  </div>
                  <p>
                    Penny generates a secure PayPal checkout link. You review the total
                    and approve payment directly in the PayPal sandbox window.
                  </p>
                  <div className="mode-feature-tag">YOU APPROVE REDIRECT</div>
                </div>

                <div className="mode-box highlighted">
                  <div className="mode-box-header">
                    <span className="mode-num">2</span>
                    <strong>Buy for me (Autonomous)</strong>
                  </div>
                  <p>
                    You authorize a PayPal Vault Setup Token once. When you confirm an order,
                    Penny autonomously captures and settles it using tokenized non-custodial credentials.
                  </p>
                  <div className="mode-feature-tag active">AUTONOMOUS SETTLEMENT</div>
                </div>
              </div>

              <div className="demo-stream-note">
                <svg fill="none" height="14" viewBox="0 0 24 24" width="14">
                  <path
                    d="m12 3 1.2 3.3L16.5 8l-3.3 1.2L12 12.5l-1.2-3.3L7.5 8l3.3-1.7L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
                <span>Live updates stream order fulfillment and status in real time.</span>
              </div>
            </div>
          </div>
        )}

        <footer className="preferences-footer" style={{ borderTop: "1px solid #e5e5dc" }}>
          <button onClick={onClose}>Close Walkthrough</button>
          <button
            onClick={() => {
              if (activeStep === "search") setActiveStep("decide")
              else if (activeStep === "decide") setActiveStep("settle")
              else onClose()
            }}
          >
            {activeStep === "settle" ? "Start Shopping with Penny" : "Next Architecture Step &rarr;"}
          </button>
        </footer>
      </section>
    </div>
  )
}

