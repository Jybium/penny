import { ReactNode } from "react"

/**
 * Formats Markdown text into clean React elements.
 * Supports bold (**text**), italics (*text*), code (`code`),
 * links ([text](url)), bullet lists, tables, headers, and paragraphs.
 */
export function formatPennyMessage(text: string): ReactNode {
  if (!text) return null

  // Split lines
  const lines = text.split("\n")
  const elements: ReactNode[] = []
  let inList = false
  let listItems: ReactNode[] = []
  let inTable = false
  let tableRows: string[][] = []

  function flushList() {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          style={{
            margin: "8px 0 12px 18px",
            paddingLeft: 0,
            display: "grid",
            gap: 6,
          }}
        >
          {listItems}
        </ul>,
      )
      listItems = []
      inList = false
    }
  }

  function flushTable() {
    if (inTable && tableRows.length > 0) {
      const headerRow = tableRows[0]
      const bodyRows = tableRows.slice(1).filter((r) => !r.every((c) => /^:?-+:?$/.test(c.trim())))

      elements.push(
        <div
          key={`table-${elements.length}`}
          style={{
            margin: "10px 0 14px",
            overflowX: "auto",
            borderRadius: 6,
            border: "1px solid #d8dfd9",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 11,
              textAlign: "left",
            }}
          >
            {headerRow && (
              <thead style={{ background: "#edf2ee", borderBottom: "1px solid #d8dfd9" }}>
                <tr>
                  {headerRow.map((col, idx) => (
                    <th key={idx} style={{ padding: "8px 10px", fontWeight: 700 }}>
                      {renderInline(col.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {bodyRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    borderBottom: rIdx < bodyRows.length - 1 ? "1px solid #e7ece8" : "none",
                    background: rIdx % 2 === 0 ? "#ffffff" : "#fbfdfc",
                  }}
                >
                  {row.map((col, cIdx) => (
                    <td key={cIdx} style={{ padding: "8px 10px" }}>
                      {renderInline(col.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      tableRows = []
      inTable = false
    }
  }

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim()

    // Table row detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList()
      inTable = true
      const cells = trimmed
        .slice(1, -1)
        .split("|")
      tableRows.push(cells)
      return
    } else if (inTable) {
      flushTable()
    }

    // Bullet list detection
    if (/^[-*•]\s+/.test(trimmed)) {
      inList = true
      const content = trimmed.replace(/^[-*•]\s+/, "")
      listItems.push(
        <li key={`li-${lineIdx}`} style={{ lineHeight: 1.55 }}>
          {renderInline(content)}
        </li>,
      )
      return
    } else if (inList) {
      flushList()
    }

    // Header detection
    if (/^###\s+/.test(trimmed)) {
      elements.push(
        <h4
          key={`h4-${lineIdx}`}
          style={{ margin: "14px 0 6px", fontSize: 13, fontWeight: 700, color: "inherit" }}
        >
          {renderInline(trimmed.replace(/^###\s+/, ""))}
        </h4>,
      )
      return
    }
    if (/^##\s+/.test(trimmed)) {
      elements.push(
        <h3
          key={`h3-${lineIdx}`}
          style={{ margin: "16px 0 8px", fontSize: 14, fontWeight: 700, color: "inherit" }}
        >
          {renderInline(trimmed.replace(/^##\s+/, ""))}
        </h3>,
      )
      return
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      elements.push(
        <hr
          key={`hr-${lineIdx}`}
          style={{
            margin: "12px 0",
            border: "none",
            borderTop: "1px solid rgba(0,0,0,0.1)",
          }}
        />,
      )
      return
    }

    // Empty line
    if (!trimmed) {
      return
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${lineIdx}`} style={{ margin: "6px 0", lineHeight: 1.55 }}>
        {renderInline(trimmed)}
      </p>,
    )
  })

  flushList()
  flushTable()

  return <div className="formatted-penny-content">{elements}</div>
}

/**
 * Parses inline formatting: **bold**, *italic*, `code`, and [label](url).
 */
function renderInline(text: string): ReactNode {
  // Regex pattern matching bold, code, link, or italic
  const parts: ReactNode[] = []
  let remaining = text
  let keyIndex = 0

  while (remaining.length > 0) {
    // Links [text](url)
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/)
    // Bold **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)
    // Code `code`
    const codeMatch = remaining.match(/`([^`]+)`/)
    // Strike ~~text~~
    const strikeMatch = remaining.match(/~~([^~]+)~~/)

    // Find the earliest match
    const matches = [
      linkMatch ? { type: "link", match: linkMatch, index: linkMatch.index! } : null,
      boldMatch ? { type: "bold", match: boldMatch, index: boldMatch.index! } : null,
      codeMatch ? { type: "code", match: codeMatch, index: codeMatch.index! } : null,
      strikeMatch ? { type: "strike", match: strikeMatch, index: strikeMatch.index! } : null,
    ].filter(Boolean) as { type: string; match: RegExpMatchArray; index: number }[]

    if (matches.length === 0) {
      parts.push(remaining)
      break
    }

    matches.sort((a, b) => a.index - b.index)
    const first = matches[0]

    // Push preceding text
    if (first.index > 0) {
      parts.push(remaining.substring(0, first.index))
    }

    if (first.type === "link") {
      const label = first.match[1]
      const url = first.match[2]
      parts.push(
        <a
          key={`inline-${keyIndex++}`}
          href={url}
          rel="noopener noreferrer"
          style={{ color: "var(--penny-green, #1b5338)", textDecoration: "underline" }}
          target="_blank"
        >
          {label}
        </a>,
      )
      remaining = remaining.substring(first.index + first.match[0].length)
    } else if (first.type === "bold") {
      parts.push(
        <strong key={`inline-${keyIndex++}`} style={{ fontWeight: 700 }}>
          {first.match[1]}
        </strong>,
      )
      remaining = remaining.substring(first.index + first.match[0].length)
    } else if (first.type === "code") {
      parts.push(
        <code
          key={`inline-${keyIndex++}`}
          style={{
            background: "rgba(0,0,0,0.06)",
            padding: "2px 4px",
            borderRadius: 3,
            fontSize: "0.9em",
            fontFamily: "monospace",
          }}
        >
          {first.match[1]}
        </code>,
      )
      remaining = remaining.substring(first.index + first.match[0].length)
    } else if (first.type === "strike") {
      parts.push(
        <del key={`inline-${keyIndex++}`} style={{ opacity: 0.65 }}>
          {first.match[1]}
        </del>,
      )
      remaining = remaining.substring(first.index + first.match[0].length)
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>
}
