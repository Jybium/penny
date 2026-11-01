type Props = {
  onNavigate: (view: "chat" | "payment" | "autonomy" | "landing") => void
}

export default function CancelPage({ onNavigate }: Props) {
  return (
    <main className="result-page cancel-page page-enter">
      <div className="result-card">
        <span className="result-icon">
          <svg fill="none" height="28" viewBox="0 0 24 24" width="28">
            <path
              d="m6 6 12 12M18 6 6 18"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
            />
          </svg>
        </span>

        <p className="overline">CHECKOUT CANCELLED</p>
        <h1>No payment was made.</h1>
        <p className="result-copy">
          Your checkout session was cancelled. Your PayPal account was not charged,
          and your order items remain saved in your Penny session.
        </p>

        <div className="cancel-options">
          <button onClick={() => onNavigate("chat")}>
            <svg fill="none" height="16" viewBox="0 0 24 24" width="16">
              <path
                d="m12 3 1.2 3.3L16.5 8l-3.3 1.2L12 12.5l-1.2-3.3L7.5 8l3.3-1.7L12 3Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
            <span>
              <strong>Resume with Penny agent</strong>
              <small>Ask to adjust recommendations, quantities, or budget</small>
            </span>
            <span>&rarr;</span>
          </button>

          <button onClick={() => onNavigate("payment")}>
            <svg fill="none" height="16" viewBox="0 0 24 24" width="16">
              <rect
                height="14"
                rx="2"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                width="18"
                x="3"
                y="5"
              />
              <path
                d="M3 10h18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
            <span>
              <strong>Retry checkout</strong>
              <small>Re-open PayPal checkout or review purchase details</small>
            </span>
            <span>&rarr;</span>
          </button>

          <button onClick={() => onNavigate("autonomy")}>
            <svg fill="none" height="16" viewBox="0 0 24 24" width="16">
              <path
                d="M12 3 5 6v5c0 4.8 3 8.1 7 10 4-1.9 7-5.2 7-10V6l-7-3Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
            <span>
              <strong>Switch to Buy for me mode</strong>
              <small>Enable autonomous settlement with a saved PayPal token</small>
            </span>
            <span>&rarr;</span>
          </button>
        </div>

        <button className="quiet-link" onClick={() => onNavigate("landing")}>
          Return to Penny home
        </button>
      </div>
    </main>
  )
}

