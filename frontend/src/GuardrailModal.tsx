import { useEffect, useState } from "react"

export type GuardrailSettings = {
  mode: "shop-with-me" | "buy-for-me"
}

type Props = {
  open: boolean
  settings: GuardrailSettings
  hasVaultToken?: boolean
  onClose: () => void
  onSave: (settings: GuardrailSettings) => void
}

export default function GuardrailModal({
  open,
  settings,
  hasVaultToken = false,
  onClose,
  onSave,
}: Props) {
  const [draft, setDraft] = useState(settings)

  useEffect(() => {
    if (open) setDraft(settings)
  }, [open, settings])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="preferences-backdrop" onMouseDown={onClose}>
      <section
        aria-labelledby="preferences-title"
        aria-modal="true"
        className="preferences-modal mode-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="preferences-header">
          <div>
            <p>PENNY MODE</p>
            <h2 id="preferences-title">Who should complete checkout?</h2>
            <span>
              This is the only purchase setting Penny uses. You can switch modes
              before starting a checkout.
            </span>
          </div>
          <button aria-label="Close preferences" onClick={onClose}>
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

        <div className="preference-section mode-section">
          <div className="approval-options">
            <button
              className={draft.mode === "shop-with-me" ? "selected" : ""}
              onClick={() => setDraft({ mode: "shop-with-me" })}
            >
              <i>{draft.mode === "shop-with-me" && <span />}</i>
              <b>Shop with me</b>
              <small>You complete checkout on the PayPal login screen.</small>
            </button>
            <button
              className={draft.mode === "buy-for-me" ? "selected" : ""}
              onClick={() => setDraft({ mode: "buy-for-me" })}
            >
              <i>{draft.mode === "buy-for-me" && <span />}</i>
              <b>Buy for me</b>
              <small>Penny completes checkout with your saved PayPal.</small>
              <em>{hasVaultToken ? "AUTONOMOUS (VAULT READY)" : "PAYPAL APPROVAL REQUIRED"}</em>
            </button>
          </div>
        </div>

        <div className="preference-note">
          <svg fill="none" height="17" viewBox="0 0 24 24" width="17">
            <path
              d="M12 3 5 6v5c0 4.8 3 8.1 7 10 4-1.9 7-5.2 7-10V6l-7-3Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
          <p>
            {draft.mode === "buy-for-me" && !hasVaultToken
              ? "Switching to Buy for me requires authorizing a PayPal Vault setup token. You will be redirected to PayPal to complete authorization."
              : draft.mode === "shop-with-me" && hasVaultToken
                ? "Switching to Shop for me will securely delete your saved PayPal vault token."
                : "Shop for me mode lets you review and manually approve every order on the PayPal checkout screen."}
          </p>
        </div>

        <footer className="preferences-footer">
          <button onClick={onClose}>Cancel</button>
          <button onClick={() => onSave(draft)}>
            {draft.mode === "buy-for-me" && !hasVaultToken
              ? "Authorize on PayPal"
              : draft.mode === "shop-with-me" && hasVaultToken
                ? "Delete Vault & Switch"
                : "Save Penny mode"}
          </button>
        </footer>
      </section>
    </div>
  )
}
