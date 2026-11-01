import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import LandingPage from "./LandingPage"
import GuardrailModal from "./GuardrailModal"
import DemoModal from "./DemoModal"
import AuthModal, {
  AuthMode,
  AuthPayload,
  AuthUser,
} from "./AuthModal"
import { api, ChatResponse } from "./api"
import PaymentPage from "./pages/PaymentPage"
import SuccessPage from "./pages/SuccessPage"
import CancelPage from "./pages/CancelPage"
import AutonomyPage from "./pages/AutonomyPage"

export type View =
  | "landing"
  | "chat"
  | "review"
  | "payment"
  | "success"
  | "cancel"
  | "autonomy"

type IconName =
  | "arrow"
  | "back"
  | "bag"
  | "card"
  | "check"
  | "chevron"
  | "clock"
  | "copy"
  | "edit"
  | "external"
  | "lock"
  | "minus"
  | "plus"
  | "send"
  | "settings"
  | "shield"
  | "sparkles"
  | "user"
  | "x"

type Guardrails = {
  mode: "shop-with-me" | "buy-for-me"
}

type ToastItem = {
  id: number
  message: string
  tone: "success" | "info" | "error"
}

type ChatMessage = {
  id: string
  role: "user" | "penny"
  content: string
  imageUrl?: string
  fileName?: string
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
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
        <rect height="14" rx="2" width="18" x="3" y="5" />
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
        <rect height="11" rx="2" width="11" x="8" y="8" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </>
    ),
    edit: (
      <>
        <path d="m4 16-1 5 5-1L19 9l-4-4L4 16Z" />
        <path d="m13 7 4 4" />
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
        <rect height="10" rx="2" width="14" x="5" y="10" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    minus: <path d="M5 12h14" />,
    plus: <path d="M12 5v14M5 12h14" />,
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4 20-7Z" />
        <path d="M22 2 11 13" />
      </>
    ),
    settings: (
      <>
        <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" />
      </>
    ),
    shield: <path d="M12 3 5 6v5c0 4.8 3 8.1 7 10 4-1.9 7-5.2 7-10V6l-7-3Z" />,
    sparkles: (
      <>
        <path d="m12 3 1.2 3.3L16.5 8l-3.3 1.2L12 12.5l-1.2-3.3L7.5 8l3.3-1.7L12 3Z" />
        <path d="m18 13 .8 2.2L21 16l-2.2.8L18 19l-.8-2.2L15 16l2.2-.8L18 13Z" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    x: <path d="m6 6 12 12M18 6 6 18" />,
  }

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
  )
}

function viewFromPath(pathname: string): View {
  if (pathname === "/chat") return "chat"
  if (pathname === "/review") return "review"
  if (pathname === "/checkout") return "payment"
  if (pathname === "/order/success") return "success"
  if (pathname === "/checkout/cancel") return "cancel"
  if (pathname === "/autonomy") return "autonomy"
  return "landing"
}

const suggestions = [
  "Find me wireless noise cancelling headphones under $150",
  "Help me compare top running shoes for marathons",
  "I need an ergonomic mechanical keyboard for typing",
]

function Header({
  goTo,
  onCustomize,
  onOpenDemo,
  user,
}: {
  goTo: (view: View) => void
  onCustomize: () => void
  onOpenDemo: () => void
  user: AuthUser | null
}) {
  return (
    <header className="app-header">
      <button className="wordmark" onClick={() => goTo("chat")}>
        <span className="wordmark-icon">
          <Icon name="sparkles" size={16} />
        </span>
        Penny
      </button>

      <div className="header-demo-center">
        <button
          className="demo-trigger-button"
          onClick={onOpenDemo}
          title="See an interactive demo of how Penny works"
          type="button"
        >
          <span className="demo-trigger-pill">SYSTEM DEMO</span>
          <span className="demo-trigger-label">How Penny Works</span>
          <Icon name="sparkles" size={14} />
        </button>
      </div>

      <div className="header-actions">
        <button
          className="customize-button"
          onClick={() => goTo("autonomy")}
          style={{ background: "#f1f8f3", borderColor: "#c2ded0", color: "#2d5e46" }}
          title="Manage PayPal Vault & Autonomous Payments"
          type="button"
        >
          <Icon name="shield" size={14} /> Autonomy
        </button>
        <button
          aria-label="Customize shopping preferences"
          className="customize-button"
          onClick={onCustomize}
          type="button"
        >
          <Icon name="settings" size={15} /> Preferences
        </button>
        <button
          aria-label={user ? `${user.firstName}'s account` : "Account"}
          className="profile-button"
          title={user?.email}
          type="button"
        >
          {user
            ? `${user.firstName[0] || ""}${user.lastName[0] || ""}`.toUpperCase()
            : "AM"}
        </button>
      </div>
    </header>
  )
}

function ChatView({
  goTo,
  guardrails,
  onCustomize,
  onOpenDemo,
  onNotify,
  token,
  presetQuery,
}: {
  goTo: (view: View) => void
  guardrails: Guardrails
  onCustomize: () => void
  onOpenDemo: () => void
  onNotify: (message: string, tone?: ToastItem["tone"]) => void
  token: string
  presetQuery?: string
}) {
  const [text, setText] = useState(presetQuery || "")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "intro-penny",
      role: "penny",
      content:
        "What are you looking for today?\nShare your budget, must-haves, or attach a product photo. I’ll search real merchant catalogs, compare options, and prepare your order.",
    },
  ])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (presetQuery) {
      setText(presetQuery)
    }
  }, [presetQuery])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] || null
    if (!selected) return

    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      onNotify("Please select an image file (JPEG, PNG, or WEBP).", "error")
      return
    }

    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    onNotify(`Attached "${selected.name}" for visual search.`, "info")
  }

  function handleRemoveFile() {
    setFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault()
    if (!text.trim() && !file) return

    const userQuery = text.trim() || (file ? "Find products matching this photo" : "")
    const currentFile = file
    const currentPreview = previewUrl

    // Append user message immediately
    const userMsgId = `user-${Date.now()}`
    setChatMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: "user",
        content: userQuery,
        imageUrl: currentPreview || undefined,
        fileName: currentFile?.name,
      },
    ])

    setText("")
    setFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    setSending(true)

    try {
      const response = await api.chat(userQuery, token, currentFile)
      const pennyText =
        typeof response === "string"
          ? response
          : (response?.penny || "I’ve updated your recommendation.")

      setChatMessages((prev) => [
        ...prev,
        {
          id: `penny-${Date.now()}`,
          role: "penny",
          content: pennyText,
        },
      ])

      // Check if response contains a PayPal payment link
      const paypalMatch = pennyText.match(/https?:\/\/[^\s)]*sandbox\.paypal\.com[^\s)]*/i)
      if (paypalMatch) {
        const pending = {
          paypalApprovalUrl: paypalMatch[0],
          totalPrice: 129.0,
          currency: "USD",
          items: [
            {
              description: "Penny Curated Order",
              quantity: 1,
              unitPrice: 129.0,
            },
          ],
          mode: guardrails.mode,
        }
        sessionStorage.setItem("penny_pending_order", JSON.stringify(pending))
        onNotify("PayPal order generated! You can now proceed to checkout.", "info")
      }
    } catch (reason) {
      onNotify(
        reason instanceof Error
          ? reason.message
          : "Penny couldn’t send your message.",
        "error",
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="chat-layout page-enter">
      <aside className="context-rail">
        <div className="context-top">
          <p className="overline">NEW PURCHASE</p>
          <h2>Let’s find the right fit, not just a product.</h2>
          <p>
            Shop the way you’d talk to someone who knows you. Start with what
            you need or an image, then shape the answer together.
          </p>
        </div>

        <div className="agent-rules">
          <p className="overline">YOUR DEFAULT CONTROLS</p>
          <div>
            <Icon name="shield" size={16} />
            <span>
              <strong>
                {guardrails.mode === "shop-with-me"
                  ? "Shop with me"
                  : "Buy for me"}
              </strong>
              <small>
                {guardrails.mode === "shop-with-me"
                  ? "You complete PayPal checkout"
                  : "Penny completes checkout with saved vault"}
              </small>
            </span>
          </div>
        </div>

        <button className="edit-guardrails" onClick={onCustomize}>
          <Icon name="settings" size={14} /> Change Penny mode
        </button>

        <button className="edit-guardrails" onClick={onOpenDemo} style={{ marginTop: 8 }}>
          <Icon name="sparkles" size={14} /> How Penny Works Demo
        </button>

        <div className="autonomy-preview">
          <span className="soon-badge available-badge">AVAILABLE</span>
          <h3>Autonomous payments</h3>
          <p>
            With Buy for me mode, Penny uses your saved PayPal token to capture
            orders automatically.
          </p>
          <button onClick={() => goTo("autonomy")}>
            Configure PayPal Vault <Icon name="arrow" size={14} />
          </button>
        </div>
      </aside>

      <section className="conversation">
        <div className="conversation-head">
          <div>
            <span className="agent-avatar">
              <Icon name="sparkles" size={17} />
            </span>
            <div>
              <strong>Commerce agent</strong>
              <small>Multimodal Search &bull; LangGraph &bull; PayPal Ready</small>
            </div>
          </div>
          <span className="live-dot">Online</span>
        </div>

        <div className="messages">
          <div className="date-divider">
            <span>Today</span>
          </div>

          <div className="suggestion-row">
            {suggestions.map((suggestion) => (
              <button key={suggestion} onClick={() => setText(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>

          {chatMessages.map((msg) => {
            const isUser = msg.role === "user"
            const hasPayPalLink =
              !isUser &&
              (msg.content.includes("sandbox.paypal.com") ||
                msg.content.toLowerCase().includes("paypal"))

            return (
              <div
                className={isUser ? "message user-message" : "agent-message-row"}
                key={msg.id}
              >
                {!isUser && (
                  <span className="mini-avatar">
                    <Icon name="sparkles" size={13} />
                  </span>
                )}

                <div className={isUser ? "" : "message agent-message"}>
                  {msg.imageUrl && (
                    <div
                      style={{
                        marginBottom: 8,
                        borderRadius: 6,
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.3)",
                        maxWidth: 240,
                      }}
                    >
                      <img
                        alt="Uploaded for search"
                        src={msg.imageUrl}
                        style={{ display: "block", width: "100%", height: "auto" }}
                      />
                      {msg.fileName && (
                        <div
                          style={{
                            padding: "3px 6px",
                            fontSize: 9,
                            background: "rgba(0,0,0,0.5)",
                            color: "#fff",
                          }}
                        >
                          {msg.fileName}
                        </div>
                      )}
                    </div>
                  )}

                  <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.content}</p>

                  {hasPayPalLink && (
                    <div style={{ marginTop: 12, borderTop: "1px solid #dcdfd8", paddingTop: 10 }}>
                      <button
                        className="primary-action"
                        onClick={() => goTo("payment")}
                        style={{ padding: "8px 12px", width: "auto", display: "inline-flex", gap: 8 }}
                      >
                        Proceed to Checkout <Icon name="arrow" size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {sending && (
            <div aria-live="polite" className="agent-message-row">
              <span className="mini-avatar">
                <Icon name="sparkles" size={13} />
              </span>
              <div className="message agent-message thinking-message">
                <span />
                <span />
                <span />
                Penny is researching
              </div>
            </div>
          )}
        </div>

        <form className="composer" onSubmit={sendMessage}>
          {file && (
            <div className="file-chip">
              <Icon name="sparkles" size={12} />
              <span>{file.name}</span>
              <button
                aria-label="Remove attachment"
                onClick={handleRemoveFile}
                type="button"
              >
                <Icon name="x" size={12} />
              </button>
            </div>
          )}

          <input
            aria-label="Message your commerce agent"
            onChange={(event) => setText(event.target.value)}
            placeholder={
              file
                ? "Add specifics (budget, color, sizing) or press Enter to search photo..."
                : "Ask Penny to search, compare, or attach a photo..."
            }
            value={text}
          />

          <label
            className="file-button"
            title="Attach a product photo or screenshot (JPEG, PNG, WEBP)"
          >
            <input
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              ref={fileInputRef}
              type="file"
            />
            <Icon name="plus" size={16} />
          </label>

          <button
            aria-label="Send message"
            className="send-button"
            disabled={sending || (!text.trim() && !file)}
            type="submit"
          >
            {sending ? (
              <span className="button-spinner" />
            ) : (
              <Icon name="send" size={17} />
            )}
          </button>
          <p>
            <Icon name="shield" size={12} />{" "}
            {guardrails.mode === "shop-with-me"
              ? "Shop with me: you complete checkout"
              : "Buy for me: Penny completes checkout"}
          </p>
        </form>
      </section>
    </main>
  )
}

function ReviewView({
  goTo,
}: {
  goTo: (view: View) => void
}) {
  return (
    <main className="review-page page-enter">
      <button className="back-button" onClick={() => goTo("chat")}>
        <Icon name="back" size={14} /> Back to Penny conversation
      </button>

      <div className="review-heading">
        <div>
          <p className="overline">AGENT RECOMMENDATION</p>
          <h1>Curated Decision Set</h1>
          <p>Penny analyzed specs, real-time pricing, and user reviews to select this option.</p>
        </div>
        <div className="confidence">
          <span>96%</span>
          <div>
            <strong>High confidence match</strong>
            <small>Matches budget, active noise cancellation, and rating threshold</small>
          </div>
        </div>
      </div>

      <div className="review-grid">
        <section className="recommendations">
          <article className="decision-card">
            <div className="product-visual">
              <span className="best-match">BEST MATCH</span>
              <div
                style={{
                  height: "100%",
                  minHeight: 220,
                  display: "grid",
                  placeItems: "center",
                  color: "#6c8879",
                }}
              >
                <Icon name="bag" size={48} />
              </div>
            </div>
            <div className="decision-info">
              <span className="brand-name">AUDIO PRO</span>
              <h2>Noise-Cancelling Over-Ear Headphones</h2>
              <p className="product-meta">Model NC-800 &bull; 40hr Battery &bull; Multipoint Bluetooth</p>
              <div className="rating">
                ★ 4.8 <span>(1,420 verified buyer reviews)</span>
              </div>
              <div className="reason-box">
                <strong>Why Penny selected this:</strong>
                <p>
                  Offers top-tier active noise cancellation in the sub-$150 price tier.
                  Lightweight headband, fast USB-C charging, and compatible with all major devices.
                </p>
              </div>
              <div className="merchant-line">
                <span>Verified PayPal Sandbox Merchant</span>
                <strong>$129.00 USD</strong>
              </div>
            </div>
          </article>
        </section>

        <aside className="decision-summary">
          <h2>Purchase Summary</h2>
          <div className="summary-lines">
            <div>
              <span>Subtotal</span>
              <strong>$129.00</strong>
            </div>
            <div>
              <span>Estimated Shipping</span>
              <span className="positive">FREE</span>
            </div>
            <div>
              <span>Estimated Tax</span>
              <span>$0.00</span>
            </div>
            <div className="summary-total">
              <strong>Total</strong>
              <strong>$129.00 USD</strong>
            </div>
          </div>

          <div className="decision-details">
            <div>
              <Icon name="shield" size={15} />
              <span>
                <strong>Buyer Protected</strong>
                <small>Full PayPal Purchase Protection included</small>
              </span>
            </div>
            <div>
              <Icon name="clock" size={15} />
              <span>
                <strong>Fast Dispatch</strong>
                <small>Ships within 24 hours of settlement</small>
              </span>
            </div>
          </div>

          <button className="primary-action" onClick={() => goTo("payment")}>
            Approve &amp; Continue to Checkout <Icon name="arrow" size={14} />
          </button>
        </aside>
      </div>
    </main>
  )
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const view = viewFromPath(location.pathname)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)
  const [demoPresetQuery, setDemoPresetQuery] = useState("")
  const [authMode, setAuthMode] = useState<AuthMode>("signup")
  const [authOpen, setAuthOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = sessionStorage.getItem("penny_user")
    if (!saved) return null
    try {
      return JSON.parse(saved) as AuthUser
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(
    () => sessionStorage.getItem("penny_access_token") || "",
  )
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [guardrails, setGuardrails] = useState<Guardrails>(() => ({
    mode:
      sessionStorage.getItem("penny_mode") === "buy-for-me"
        ? "buy-for-me"
        : "shop-with-me",
  }))

  const pageTitle = useMemo(() => {
    if (view === "landing") return "Penny — Agentic commerce"
    if (view === "success") return "Payment approved — Penny"
    if (view === "cancel") return "Payment cancelled — Penny"
    if (view === "payment") return "Checkout & Payment — Penny"
    if (view === "autonomy") return "Autonomous Commerce — Penny"
    if (view === "review") return "Decision Review — Penny"
    return "Penny commerce agent"
  }, [view])

  useEffect(() => {
    document.title = pageTitle
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [pageTitle])

  function goTo(next: View) {
    const paths: Record<View, string> = {
      landing: "/",
      chat: "/chat",
      review: "/review",
      payment: "/checkout",
      success: "/order/success",
      cancel: "/checkout/cancel",
      autonomy: "/autonomy",
    }
    navigate(paths[next])
  }

  function openAuth(mode: AuthMode) {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  function enterAgent() {
    if (user) goTo("chat")
    else openAuth("signup")
  }

  function notify(message: string, tone: ToastItem["tone"] = "success") {
    const id = Date.now()
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3500)
  }

  async function authenticate(mode: AuthMode, payload: AuthPayload) {
    if (mode === "signup") {
      await api.register({
        first_name: payload.firstName,
        last_name: payload.lastName,
        email: payload.email,
        password: payload.password,
        gender: payload.gender || "female",
      })
    }

    const response = await api.login(payload.email, payload.password)
    const nextUser: AuthUser = {
      id: response.user.id,
      firstName: response.user.first_name,
      lastName: response.user.last_name,
      email: response.user.email,
      gender: response.user.gender,
      role: response.user.role,
    }
    sessionStorage.setItem("penny_access_token", response.access_token)
    sessionStorage.setItem("penny_user", JSON.stringify(nextUser))
    setToken(response.access_token)
    setUser(nextUser)
    setAuthOpen(false)
    notify(
      mode === "signup"
        ? `Welcome to Penny, ${nextUser.firstName}.`
        : `Welcome back, ${nextUser.firstName}.`,
    )
    goTo("chat")
  }

  return (
    <div className="app">
      {view !== "landing" && view !== "success" && view !== "cancel" && (
        <Header
          goTo={goTo}
          onCustomize={() => setPreferencesOpen(true)}
          onOpenDemo={() => setDemoOpen(true)}
          user={user}
        />
      )}

      {view === "landing" && (
        <LandingPage
          onEnter={enterAgent}
          onSignIn={() => openAuth("signin")}
          onSignUp={() => openAuth("signup")}
        />
      )}

      {view === "chat" && (
        <ChatView
          goTo={goTo}
          guardrails={guardrails}
          onCustomize={() => setPreferencesOpen(true)}
          onNotify={notify}
          onOpenDemo={() => setDemoOpen(true)}
          presetQuery={demoPresetQuery}
          token={token}
        />
      )}

      {view === "review" && <ReviewView goTo={goTo} />}

      {view === "payment" && (
        <PaymentPage
          onNavigate={goTo}
          onNotify={notify}
          token={token}
        />
      )}

      {view === "success" && (
        <SuccessPage onNavigate={goTo} token={token} />
      )}

      {view === "cancel" && (
        <CancelPage onNavigate={goTo} />
      )}

      {view === "autonomy" && (
        <AutonomyPage
          onNavigate={goTo}
          onNotify={notify}
          token={token}
        />
      )}

      <DemoModal
        onClose={() => setDemoOpen(false)}
        onTryQuery={(q) => {
          setDemoPresetQuery(q)
          goTo("chat")
        }}
        open={demoOpen}
      />

      <GuardrailModal
        onClose={() => setPreferencesOpen(false)}
        onSave={(settings) => {
          setGuardrails(settings)
          sessionStorage.setItem("penny_mode", settings.mode)
          setPreferencesOpen(false)
          notify(
            `${
              settings.mode === "shop-with-me"
                ? "Shop with me"
                : "Buy for me"
            } mode saved.`,
          )
        }}
        open={preferencesOpen}
        settings={guardrails}
      />

      <AuthModal
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
        onSubmit={authenticate}
        open={authOpen}
      />

      <div
        aria-atomic="true"
        aria-live="polite"
        className="toast-region"
      >
        {toasts.map((toast) => (
          <div className={`toast toast-${toast.tone}`} key={toast.id}>
            <span>
              <Icon
                name={
                  toast.tone === "success"
                    ? "check"
                    : toast.tone === "error"
                      ? "x"
                      : "sparkles"
                }
                size={15}
              />
            </span>
            <p>{toast.message}</p>
            <button
              aria-label="Dismiss notification"
              onClick={() =>
                setToasts((current) =>
                  current.filter((item) => item.id !== toast.id),
                )
              }
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
