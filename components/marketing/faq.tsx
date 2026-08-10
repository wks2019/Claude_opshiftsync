interface FaqItem {
  q: string
  a: string
}

/** Two-column FAQ built on <details>/<summary>, the same native-disclosure
 *  pattern as the mobile nav: no JavaScript, keyboard operable for free, and
 *  nothing to hydrate before it works. */
export function Faq({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="grid gap-x-12 sm:grid-cols-2">
      {items.map((item) => (
        <details key={item.q} className="group border-b hairline py-4">
          <summary className="eyebrow flex cursor-pointer list-none items-center justify-between gap-4 text-ink [&::-webkit-details-marker]:hidden">
            <span className="text-left normal-case tracking-normal text-ink" style={{ fontFamily: 'var(--font-display)' }}>
              {item.q}
            </span>
            <span aria-hidden="true" className="shrink-0 text-brass-text transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 max-w-[46ch] text-sm text-stone">{item.a}</p>
        </details>
      ))}
    </div>
  )
}
