const ORDERS = [
  { room: '1204', name: 'Rossi', items: '2 items', status: 'New', age: '4 min', tone: 'new' },
  { room: '312', name: 'Al Fayed', items: '5 items', status: 'Preparing', age: '11 min', tone: 'work' },
  { room: '204', name: 'Whitmore', items: '1 item', status: 'On the way', age: '18 min', tone: 'work' },
  { room: '415', name: 'Nakamura', items: '3 items', status: 'Delivered', age: '32 min', tone: 'done' },
] as const

const TONE: Record<string, string> = {
  new: 'text-ink',
  work: 'text-brass-text',
  done: 'text-sage',
}

/**
 * The kitchen's order queue, as the guest's order reaches it.
 *
 * This is the homepage artefact because the buyer is the general manager, not
 * the guest: what sells the product is the operational view, not the novelty
 * of ordering on a phone. It is typeset rather than screenshotted so it stays
 * sharp, stays on palette, and cannot go stale when the real UI changes.
 *
 * Status is carried by the word itself, not by colour, so it survives
 * greyscale and colour blindness. The tone classes only reinforce it.
 */
export function OrderQueue() {
  return (
    <div className="border hairline bg-paper-raised">
      <div className="flex items-baseline justify-between border-b hairline px-6 py-4">
        <span className="eyebrow">In-room dining · Kitchen</span>
        <span className="eyebrow flex items-center gap-2 text-brass-text">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brass" aria-hidden="true" />
          Live
        </span>
      </div>

      <ol className="px-6">
        {ORDERS.map((o) => (
          <li key={o.room} className="border-b hairline py-4 last:border-b-0">
            <div className="flex items-baseline justify-between gap-4">
              <span className="flex items-baseline gap-3">
                <span className="data text-lg text-ink">{o.room}</span>
                <span className="text-sm text-ink-soft">{o.name}</span>
              </span>
              <span className="flex items-baseline gap-4">
                <span className="eyebrow">{o.items}</span>
                <span className={`eyebrow ${TONE[o.tone]}`}>{o.status}</span>
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-4">
              <div className="service-bar w-full max-w-[14rem]" aria-hidden="true">
                <span style={{ width: o.tone === 'done' ? '100%' : o.tone === 'work' ? '60%' : '15%' }} />
              </div>
              <span className="data text-xs text-stone">{o.age}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
