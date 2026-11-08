import { ReactNode, useEffect, useRef, useState } from "react"

export type ParsedProduct = {
  index?: string
  title: string
  price?: string
  retailer?: string
  inStock?: boolean
  rating?: string
  extra?: string
  imageUrl?: string
  imageAlt?: string
}

/**
 * Modern product card component for Penny chat
 */
export function ProductCard({ product }: { product: ParsedProduct }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="penny-product-card">
      <div className="penny-product-thumb">
        {product.imageUrl && !imgError ? (
          <img
            alt={product.imageAlt || product.title}
            loading="lazy"
            onError={() => setImgError(true)}
            src={product.imageUrl}
          />
        ) : (
          <div className="penny-product-thumb-placeholder">
            <svg fill="none" height="22" stroke="currentColor" viewBox="0 0 24 24" width="22">
              <rect height="18" rx="2" strokeWidth="1.5" width="18" x="3" y="3" />
              <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
              <path d="m21 15-5-5L5 21" strokeWidth="1.5" />
            </svg>
            <span>Product</span>
          </div>
        )}
      </div>

      <div className="penny-product-info">
        <div>
          <div className="penny-product-top">
            {product.index && (
              <span className="penny-product-index">#{product.index}</span>
            )}
            {product.inStock && (
              <span className="penny-product-stock">IN STOCK</span>
            )}
            {product.rating && (
              <span className="penny-product-rating">
                ★ {product.rating}
              </span>
            )}
          </div>

          <h4 className="penny-product-title" title={product.title}>
            {product.title}
          </h4>
        </div>

        <div>
          <div className="penny-product-meta">
            {product.price && (
              <span className="penny-product-price">{product.price}</span>
            )}
            {product.retailer && (
              <span className="penny-product-retailer">
                at <strong>{product.retailer}</strong>
              </span>
            )}
          </div>

          {product.extra && (
            <p className="penny-product-extra">{product.extra}</p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Horizontal scrolling carousel for Penny search results with smooth nav arrows
 */
export function ProductCarousel({ products }: { products: ParsedProduct[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", updateScrollState, { passive: true })
    window.addEventListener("resize", updateScrollState)
    return () => {
      el.removeEventListener("scroll", updateScrollState)
      window.removeEventListener("resize", updateScrollState)
    }
  }, [products])

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const offset = direction === "left" ? -240 : 240
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" })
  }

  return (
    <div className="penny-carousel-wrapper">
      {products.length > 1 && canScrollLeft && (
        <button
          aria-label="Previous products"
          className="penny-carousel-arrow penny-carousel-prev"
          onClick={() => scroll("left")}
          type="button"
        >
          <svg fill="none" height="14" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" width="14">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      <div className="penny-products-container" ref={scrollRef}>
        {products.map((p, idx) => (
          <ProductCard key={`${p.title}-${idx}`} product={p} />
        ))}
      </div>

      {products.length > 1 && canScrollRight && (
        <button
          aria-label="Next products"
          className="penny-carousel-arrow penny-carousel-next"
          onClick={() => scroll("right")}
          type="button"
        >
          <svg fill="none" height="14" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" width="14">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  )
}

/**
 * Formats Markdown text into clean, modern React elements with product cards,
 * tables, lists, and inline media.
 */
export function formatPennyMessage(text: string): ReactNode {
  if (!text) return null

  const rawLines = text.split("\n")
  const elements: ReactNode[] = []

  let inTable = false
  let tableRows: string[][] = []

  let inBulletList = false
  let bulletItems: ReactNode[] = []

  let currentProduct: ParsedProduct | null = null
  let pendingProducts: ParsedProduct[] = []

  function commitCurrentProduct() {
    if (currentProduct) {
      pendingProducts.push(currentProduct)
      currentProduct = null
    }
  }

  function flushProducts() {
    commitCurrentProduct()
    if (pendingProducts.length > 0) {
      elements.push(
        <ProductCarousel
          key={`products-${elements.length}`}
          products={pendingProducts}
        />,
      )
      pendingProducts = []
    }
  }

  function flushList() {
    if (inBulletList && bulletItems.length > 0) {
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
          {bulletItems}
        </ul>,
      )
      bulletItems = []
      inBulletList = false
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

  function extractProductMetadata(text: string, product: ParsedProduct) {
    // 1. Image
    const imgMatch = text.match(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/)
    if (imgMatch) {
      if (!product.imageUrl) {
        product.imageAlt = imgMatch[1]
        product.imageUrl = imgMatch[2]
      }
      text = text.replace(imgMatch[0], "").trim()
    }

    // 2. Price
    const priceMatch = text.match(/(\$[\d,]+(?:\.\d{2})?)/)
    if (priceMatch && !product.price) {
      product.price = priceMatch[1]
    }

    // 3. In stock
    if (/\b(instock|in\s+stock)\b/i.test(text)) {
      product.inStock = true
    }

    // 4. Rating
    const ratingMatch = text.match(/(?:rated\s+|★\s*|\b)([\d.]+(?:\s*(?:from|out of|\/)\s*[\w\d\s]+)?(?:\s*★|\s*stars)?)/i)
    if (ratingMatch && !product.rating && (text.includes("★") || text.toLowerCase().includes("rated") || text.toLowerCase().includes("star"))) {
      product.rating = ratingMatch[1].trim()
    }

    // 5. Retailer (e.g. at snipesusa.com, jdsports.com or from fleetfeet.com)
    const retailerMatch = text.match(/(?:at|available at|store:?|from:?)\s+([A-Z0-9][\w\s&'.-]{1,35}?)(?=\s*,|\s+and\b|\s*\([iI]n\s*[sS]tock|\s*;|\s*$|\s*rated|\s*—|\s*–)/i)
    if (retailerMatch && !product.retailer) {
      product.retailer = retailerMatch[1].trim().replace(/\.$/, "")
    }

    // 6. Brand (e.g. (Nike) or (New Balance))
    const brandMatch = text.match(/^\s*\(([^)]+)\)/)
    let brand = ""
    if (brandMatch) {
      brand = brandMatch[1].trim()
      text = text.replace(brandMatch[0], "").trim()
    }

    // 7. Remaining descriptive text
    let extra = text
      .replace(/^[-*•]\s*/, "")
      .replace(/^(?:price|store|retailer|rating|features?|details?):\s*/i, "")
      .replace(/^[—–-]\s*/, "")
      .trim()

    if (product.price) extra = extra.replace(product.price, "").trim()
    if (product.retailer) {
      extra = extra.replace(new RegExp(`(?:at|available at|store:?|from:?)\\s+${product.retailer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i"), "").trim()
    }
    extra = extra.replace(/\(?in\s*stock\)?/gi, "").replace(/;?\s*rated[^;.]*[;.]?/gi, "").replace(/^[,\s;—–-]+|[,\s;—–-]+$/g, "").trim()

    if (brand) {
      extra = extra ? `${brand} • ${extra}` : brand
    }

    if (extra.length > 2) {
      product.extra = product.extra ? `${product.extra} • ${extra}` : extra
    }
  }

  function parseProductHeader(trimmed: string, nextLine?: string): { index?: string; title: string; remaining: string } | null {
    if (
      trimmed.startsWith("#") ||
      trimmed.startsWith(">") ||
      trimmed.startsWith("|") ||
      trimmed.startsWith("```") ||
      /^[-*_]{3,}$/.test(trimmed)
    ) {
      return null
    }

    // Pattern A: Bold title (with optional leading number or bullet)
    // e.g. "1. **Nike Vomero** (Nike) — $240.00 at ..." or "**Nike Vomero** - $240"
    const boldMatch = trimmed.match(/^(?:(?:(\d+)[\.\)]|[-*•])\s+)?\*\*([^*]+)\*\*(.*)$/)
    if (boldMatch) {
      const rawIndex = boldMatch[1]
      const rawTitle = boldMatch[2].trim()
      const remaining = (boldMatch[3] || "").trim()

      const isKeyword = /^(?:note|summary|details|features|disclaimer|important|warning|recommendation|tips?):?$/i.test(rawTitle)
      if (!isKeyword) {
        const hasPrice = /\$[\d,]+/.test(remaining)
        const hasStore = /(?:at|from|store|retailer)\s+[A-Za-z0-9]/i.test(remaining)
        const nextIsImage = nextLine && /^!\[[^\]]*\]\(https?:\/\/[^\s)]+\)/.test(nextLine.trim())
        if (rawIndex || hasPrice || hasStore || nextIsImage || remaining.includes("—") || remaining.includes("–") || remaining.includes("- $")) {
          return { index: rawIndex, title: rawTitle, remaining }
        }
      }
    }

    // Pattern B: Plain or unbolded title with brand and price separator
    // e.g. "Nike Vomero Premium NYC Marathon 2026 (Nike) — $240.00 at snipesusa.com..."
    // or "FuelCell Supercomp Elite v3 (New Balance) — $245.00 at fleetfeet.com..."
    const unboldMatch = trimmed.match(
      /^(?:(?:(\d+)[\.\)]|[-*•])\s+)?([A-Z0-9][\w\s\-\.\'\&]{2,70}?)(?:\s*\(([^)]+)\))?\s*(?:[-–—:]\s*|\s+)(\$[\d,]+(?:\.\d{2})?.*)$/,
    )
    if (unboldMatch) {
      const rawIndex = unboldMatch[1]
      const rawTitle = unboldMatch[2].trim()
      const brand = unboldMatch[3] ? unboldMatch[3].trim() : ""
      const remainingWithPrice = (unboldMatch[4] || "").trim()
      const remaining = brand ? `(${brand}) ${remainingWithPrice}` : remainingWithPrice

      return { index: rawIndex, title: rawTitle, remaining }
    }

    // Pattern C: Title followed by price in parentheses
    // e.g. "Sony WH-1000XM5 ($349 at Amazon)" or "1. Nike Pegasus ($130)"
    const parenPriceMatch = trimmed.match(
      /^(?:(?:(\d+)[\.\)]|[-*•])\s+)?([A-Z0-9][\w\s\-\.\'\&]{2,70}?)\s*\(\s*(\$[\d,]+(?:[^\)]*))\)(.*)$/,
    )
    if (parenPriceMatch) {
      const rawIndex = parenPriceMatch[1]
      const rawTitle = parenPriceMatch[2].trim()
      const pricePart = parenPriceMatch[3].trim()
      const extraPart = (parenPriceMatch[4] || "").trim()
      return { index: rawIndex, title: rawTitle, remaining: `${pricePart} ${extraPart}`.trim() }
    }

    // Pattern D: Line has price ($XX) and next line is an image, starting with capital letter
    if (nextLine && /^!\[[^\]]*\]\(https?:\/\/[^\s)]+\)/.test(nextLine.trim())) {
      const dollarIdx = trimmed.indexOf("$")
      if (dollarIdx > 3 && !trimmed.startsWith("http")) {
        const beforeDollar = trimmed.slice(0, dollarIdx).replace(/[-–—:]\s*$/, "").trim()
        const afterDollar = trimmed.slice(dollarIdx).trim()
        const titleMatch = beforeDollar.match(/^(?:(?:(\d+)[\.\)]|[-*•])\s+)?(.+)$/)
        if (titleMatch && titleMatch[2].length >= 3 && titleMatch[2].length <= 80) {
          return {
            index: titleMatch[1],
            title: titleMatch[2].replace(/\*\*([^*]+)\*\*/g, "$1").trim(),
            remaining: afterDollar,
          }
        }
      }
    }

    return null
  }

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i]
    const trimmed = line.trim()
    const nextLine = rawLines[i + 1]?.trim()

    // 1. Table Detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushProducts()
      flushList()
      inTable = true
      const cells = trimmed.slice(1, -1).split("|")
      tableRows.push(cells)
      continue
    } else if (inTable) {
      flushTable()
    }

    // 2. Product Header Detection
    const productHeaderMatch = parseProductHeader(trimmed, nextLine)

    if (productHeaderMatch) {
      flushList()
      commitCurrentProduct() // push previous product to pendingProducts

      const index = productHeaderMatch.index || `${pendingProducts.length + 1}`
      const title = productHeaderMatch.title.trim()
      const remaining = productHeaderMatch.remaining.trim()

      const newProduct: ParsedProduct = {
        index,
        title,
      }
      extractProductMetadata(remaining, newProduct)
      currentProduct = newProduct
      continue
    }

    // 3. If currently accumulating a product, check continuation lines
    if (currentProduct) {
      // Empty line between product content or between products -> keep in product mode!
      if (!trimmed) {
        continue
      }

      // Standalone image for the current product
      const standaloneImg = trimmed.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/)
      if (standaloneImg) {
        if (!currentProduct.imageUrl) {
          currentProduct.imageAlt = standaloneImg[1]
          currentProduct.imageUrl = standaloneImg[2]
          continue
        }
      }

      // Check if this line is an exit line from the product list:
      // Headings, tables, or conclusive prompts
      const isExitLine =
        /^#{1,6}\s+/.test(trimmed) ||
        /^[-*_]{3,}$/.test(trimmed) ||
        /^(?:which\s+(?:one|of\s+these)|would\s+you\s+like|let\s+me\s+know|shall\s+i|to\s+proceed|to\s+purchase|you\s+can\s+approve|click\s+below|here\s+is\s+the\s+link)/i.test(trimmed)

      if (isExitLine) {
        commitCurrentProduct()
        flushProducts()
        // and fall through to render heading/paragraph
      } else {
        // Line is part of the current product! (Description, bullet attribute, price, etc.)
        extractProductMetadata(trimmed, currentProduct)
        continue
      }
    }

    // 4. Standalone Image (when not in a product)
    const standaloneImg = trimmed.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/)
    if (standaloneImg) {
      // Check if pendingProducts has a product without an image
      if (pendingProducts.length > 0 && !pendingProducts[pendingProducts.length - 1].imageUrl) {
        pendingProducts[pendingProducts.length - 1].imageAlt = standaloneImg[1]
        pendingProducts[pendingProducts.length - 1].imageUrl = standaloneImg[2]
        continue
      }

      // Check if there are other images nearby or pending products: group them horizontally into products!
      const hasAdjacentImg = (nextLine && /^!\[[^\]]*\]\(https?:\/\/[^\s)]+\)/.test(nextLine)) ||
                            (i > 0 && /^!\[[^\]]*\]\(https?:\/\/[^\s)]+\)/.test(rawLines[i - 1].trim()))

      if (pendingProducts.length > 0 || hasAdjacentImg) {
        currentProduct = {
          index: `${pendingProducts.length + 1}`,
          title: standaloneImg[1] || `Product ${pendingProducts.length + 1}`,
          imageUrl: standaloneImg[2],
          imageAlt: standaloneImg[1],
        }
        continue
      }

      flushProducts()
      flushList()
      elements.push(
        <div className="penny-standalone-image-wrap" key={`img-${elements.length}`}>
          <img
            alt={standaloneImg[1] || "Penny product view"}
            loading="lazy"
            src={standaloneImg[2]}
          />
          {standaloneImg[1] && (
            <div className="penny-standalone-image-caption">{standaloneImg[1]}</div>
          )}
        </div>,
      )
      continue
    }

    // If we have pending products and reached non-product lines, flush
    flushProducts()

    // 5. Empty line
    if (!trimmed) {
      continue
    }

    // 6. Bullet list
    if (/^[-*•]\s+/.test(trimmed)) {
      inBulletList = true
      const content = trimmed.replace(/^[-*•]\s+/, "")
      bulletItems.push(
        <li key={`li-${i}`} style={{ lineHeight: 1.55 }}>
          {renderInline(content)}
        </li>,
      )
      continue
    } else if (inBulletList) {
      flushList()
    }

    // 7. Headings
    if (/^###\s+/.test(trimmed)) {
      elements.push(
        <h4
          key={`h4-${i}`}
          style={{ margin: "14px 0 6px", fontSize: 13, fontWeight: 700, color: "inherit" }}
        >
          {renderInline(trimmed.replace(/^###\s+/, ""))}
        </h4>,
      )
      continue
    }
    if (/^##\s+/.test(trimmed)) {
      elements.push(
        <h3
          key={`h3-${i}`}
          style={{ margin: "16px 0 8px", fontSize: 14, fontWeight: 700, color: "inherit" }}
        >
          {renderInline(trimmed.replace(/^##\s+/, ""))}
        </h3>,
      )
      continue
    }

    // 8. Horizontal rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      elements.push(
        <hr
          key={`hr-${i}`}
          style={{
            margin: "12px 0",
            border: "none",
            borderTop: "1px solid rgba(0,0,0,0.1)",
          }}
        />,
      )
      continue
    }

    // 9. Standard paragraph
    elements.push(
      <p key={`p-${i}`} style={{ margin: "6px 0", lineHeight: 1.55 }}>
        {renderInline(trimmed)}
      </p>,
    )
  }

  flushProducts()
  flushList()
  flushTable()

  return <div className="formatted-penny-content">{elements}</div>
}

/**
 * Parses inline formatting: images, **bold**, *italic*, `code`, and [label](url).
 */
function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = []
  let remaining = text
  let keyIndex = 0

  while (remaining.length > 0) {
    // Images ![alt](url) - match images BEFORE links to prevent ! from dangling
    const imgMatch = remaining.match(/!\[([^\]]*)\]\(([^)]+)\)/)
    // Links [text](url)
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/)
    // Bold **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)
    // Code `code`
    const codeMatch = remaining.match(/`([^`]+)`/)
    // Strike ~~text~~
    const strikeMatch = remaining.match(/~~([^~]+)~~/)

    const matches = [
      imgMatch ? { type: "image", match: imgMatch, index: imgMatch.index! } : null,
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

    if (first.type === "image") {
      const alt = first.match[1]
      const url = first.match[2]
      parts.push(
        <img
          alt={alt || "Product view"}
          key={`inline-img-${keyIndex++}`}
          loading="lazy"
          src={url}
          style={{
            maxWidth: "100%",
            maxHeight: 180,
            borderRadius: 6,
            border: "1px solid #dbe2dc",
            margin: "4px 0",
            display: "block",
            objectFit: "contain",
          }}
        />,
      )
      remaining = remaining.substring(first.index + first.match[0].length)
    } else if (first.type === "link") {
      const label = first.match[1]
      const url = first.match[2]
      parts.push(
        <a
          href={url}
          key={`inline-${keyIndex++}`}
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
