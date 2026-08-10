/** A kitchen ticket, typeset. Stands in for a photograph in the closing CTA.
 *
 *  The rest of the page uses two real screenshots of the live demo and
 *  nothing else; a stock or generated food photo here would be the one
 *  fabricated image on an otherwise honest page. This is drawn from the same
 *  real demo data (Room 204, Whitmore, Oysters £34.00) as the hero, in the
 *  product's own ticket vocabulary, the same device the kitchen sees when an
 *  order lands. */
export function OrderTicket() {
  return (
    <div className="mx-auto max-w-[15rem] border border-dashed border-ink/25 bg-paper-raised p-5">
      <p className="eyebrow border-b hairline pb-3">Order ticket</p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-stone">Room</dt>
          <dd className="data text-ink">204</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-stone">Guest</dt>
          <dd className="text-ink">Whitmore</dd>
        </div>
      </dl>
      <div className="mt-4 border-t hairline pt-3">
        <div className="flex justify-between gap-3 text-sm">
          <span className="text-ink-soft">1 &times; Oysters</span>
          <span className="data text-ink">£34.00</span>
        </div>
        <p className="mt-1 text-xs text-stone">Gluten-free</p>
      </div>
      <p className="eyebrow mt-4 border-t hairline pt-3 text-brass-text">Sent to kitchen</p>
    </div>
  )
}
