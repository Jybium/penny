import { FormEvent, useEffect, useState } from "react"

export type AuthMode = "signin" | "signup"

export type AuthUser = {
  id?: string
  firstName: string
  lastName: string
  email: string
  gender?: string
  role?: string
}

export type AuthPayload = AuthUser & { password: string }

type Props = {
  mode: AuthMode
  open: boolean
  onClose: () => void
  onModeChange: (mode: AuthMode) => void
  onSubmit: (mode: AuthMode, payload: AuthPayload) => Promise<void>
}

export default function AuthModal({
  mode,
  open,
  onClose,
  onModeChange,
  onSubmit,
}: Props) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [gender, setGender] = useState("female")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const signingUp = mode === "signup"

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [open, onClose])

  async function submit(event: FormEvent) {
    event.preventDefault()
    const fallbackName = email.split("@")[0] || "Shopper"
    setSubmitting(true)
    setError("")
    try {
      await onSubmit(mode, {
        firstName: signingUp ? firstName.trim() : fallbackName,
        lastName: signingUp ? lastName.trim() : "",
        email: email.trim(),
        password,
        gender,
      })
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Penny couldn’t sign you in. Please try again.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="auth-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="auth-title"
        aria-modal="true"
        className="auth-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="auth-aside">
          <span className="auth-mark">
            <svg fill="none" height="20" viewBox="0 0 24 24" width="20">
              <path
                d="m12 3 1.2 3.3L16.5 8l-3.3 1.2L12 12.5l-1.2-3.3L7.5 8l3.3-1.7L12 3ZM18 14l.7 1.7 1.8.8-1.8.7L18 19l-.7-1.8-1.8-.7 1.8-.8L18 14Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </span>
          <p>PENNY</p>
          <h2>Shopping decisions, made with an agent you can trust.</h2>
          <ul>
            <li>Choose who completes checkout</li>
            <li>Choose Shop with me or Buy for me</li>
            <li>Keep payment details with PayPal</li>
          </ul>
        </div>

        <div className="auth-form-panel">
          <button
            aria-label="Close"
            className="auth-close"
            onClick={onClose}
            type="button"
          >
            <svg fill="none" height="17" viewBox="0 0 24 24" width="17">
              <path
                d="m6 6 12 12M18 6 6 18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
          <p className="auth-eyebrow">
            {signingUp ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}
          </p>
          <h1 id="auth-title">
            {signingUp ? "Start with your rules." : "Continue shopping smarter."}
          </h1>
          <p className="auth-intro">
            {signingUp
              ? "Set up your private commerce agent in less than a minute."
              : "Sign in to your agent, preferences, and purchase history."}
          </p>

          <form onSubmit={submit}>
            {signingUp && (
              <>
                <div className="auth-name-row">
                  <label>
                    First name
                    <input
                      autoComplete="given-name"
                      onChange={(event) => setFirstName(event.target.value)}
                      required
                      value={firstName}
                    />
                  </label>
                  <label>
                    Last name
                    <input
                      autoComplete="family-name"
                      onChange={(event) => setLastName(event.target.value)}
                      required
                      value={lastName}
                    />
                  </label>
                </div>
                <label>
                  Gender
                  <select
                    onChange={(event) => setGender(event.target.value)}
                    value={gender}
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </label>
              </>
            )}
            <label>
              Email address
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </label>
            <label>
              Password
              <input
                autoComplete={signingUp ? "new-password" : "current-password"}
                minLength={8}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                required
                type="password"
                value={password}
              />
            </label>
            {signingUp && (
              <label className="auth-consent">
                <input required type="checkbox" />
                <span>
                  I agree to the Terms and understand that I control every
                  payment permission.
                </span>
              </label>
            )}
            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}
            <button className="auth-submit" disabled={submitting} type="submit">
              {submitting ? (
                <>
                  <span className="button-spinner" />
                  {signingUp ? "Creating your account…" : "Signing you in…"}
                </>
              ) : (
                <>
                  {signingUp ? "Create account" : "Sign in"}
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            {signingUp ? "Already have an account?" : "New to Penny?"}
            <button
              onClick={() => onModeChange(signingUp ? "signin" : "signup")}
              type="button"
            >
              {signingUp ? "Sign in" : "Create an account"}
            </button>
          </p>
          <small className="auth-api-note">
            Your session is securely authenticated with Penny.
          </small>
        </div>
      </section>
    </div>
  )
}
