import type { Metadata } from 'next'
import Link from 'next/link'
import { FiveStarLockup } from '@/components/marketing/five-star-lockup'
import { OrderQueue } from '@/components/marketing/order-queue'

export const metadata: Metadata = {
  title: '5STAR | Chosen Workflow',
  description:
    'In-room dining ordering. A card in the room, the menu on the guest\u2019s own phone, the order in your kitchen. No app to download and no phone call.',
}

const GUEST = [
  {
    n: '01',
    title: 'Scan',
    body: 'A printed card on the desk or the bedside table. The guest points their camera at it and the menu opens in the browser they already have. Nothing to download, no account to create.',
  },
  {
    n: '02',
    title: 'Verify',
    body: 'Room number and the surname on the reservation. Two fields, checked against your rooms list, so an order cannot be placed against a room the guest is not staying in.',
  },
  {
    n: '03',
    title: 'Order',
    body: 'They see the menu that applies at that hour, with the modifiers your kitchen actually offers, dietary tags, and the service charge already calculated. Special instructions go in the same box a waiter would write them on.',
  },
  {
    n: '04',
    title: 'Track',
    body: 'Accepted, preparing, on the way, delivered. On their own phone, updating live, without calling down to ask how long.',
  },
] as const

const KITCHEN = [
  {
    name: 'One queue',
    body: 'Every open order in one list, newest first, with the room, the surname, what was ordered and how long it has been waiting.',
  },
  {
    name: 'Live, not refreshed',
    body: 'A new order appears on the kitchen screen the moment it is placed. Nobody has to reload anything or watch a printer.',
  },
  {
    name: 'Four states',
    body: 'New, preparing, on the way, delivered. One tap moves an order along, and the guest sees the same state on their phone.',
  },
  {
    name: 'Your service periods',
    body: 'Breakfast, all day, overnight, or however your kitchen divides the day. An item only appears when it can actually be cooked.',
  },
] as const

const ADMIN = [
  'Menu categories, items, prices, dietary tags and photographs',
  'Modifier groups: required or optional, single or multiple choice, with price adjustments',
  'Service periods, with items assigned to the hours they are available',
  'Rooms and the surname on each reservation',
  'Service charge and tax, currency, and the welcome note the guest reads first',
  'Which addresses receive an email when an order is placed',
] as const

const HONEST = [
  {
    q: 'Does it take payment?',
    a: 'Not yet. Orders post to the kitchen and are settled the way you settle them now, on the folio or at checkout.',
  },
  {
    q: 'Does it talk to our PMS or POS?',
    a: 'Not yet. Integration with Opera and Symphony is planned and we would rather say so than imply otherwise.',
  },
  {
    q: 'Is it multi-property?',
    a: 'Yes. Every menu, room, order and setting belongs to one hotel, enforced at the database by Row Level Security rather than in application code.',
  },
  {
    q: 'What do we need to install?',
    a: 'Nothing. Printed cards in the rooms and a browser on a kitchen screen or tablet.',
  },
] as const

export default function FiveStarPage() {
  return (
    <>
      <section className="border-b hairline">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <FiveStarLockup subline="In-room dining ordering" />
            <h1 className="display mt-9 max-w-[13ch] text-[clamp(2.25rem,5vw,4rem)] leading-[1.08] text-ink">
              The menu, on the guest&rsquo;s own phone.
            </h1>
            <p className="mt-7 max-w-[38ch] text-lg text-ink-soft">
              5STAR is the range of apps a guest touches directly. In-room dining ordering is the
              first of them, and it is live.
            </p>
          </div>
          <div>
            <OrderQueue />
            <p className="eyebrow mt-4">The kitchen view. Live orders, as they arrive.</p>
          </div>
        </div>
      </section>

      {/* The guest journey */}
      <section className="border-b hairline">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2">The guest</p>
          <h2 className="display mb-14 max-w-[18ch] text-2xl text-ink">
            Four steps, none of them a phone call
          </h2>

          <div className="grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {GUEST.map((s) => (
              <div key={s.n} className="border-t-2 border-ink pt-5">
                <p className="eyebrow text-brass-text">{s.n}</p>
                <h3 className="display mt-2.5 mb-2 text-lg text-ink">{s.title}</h3>
                <p className="text-sm text-stone">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The kitchen */}
      <section className="border-b hairline bg-paper-raised">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2">The kitchen</p>
          <h2 className="display mb-14 max-w-[20ch] text-2xl text-ink">
            What your team sees when the order lands
          </h2>

          <dl className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {KITCHEN.map((k) => (
              <div key={k.name} className="border-t hairline pt-6">
                <dt className="display mb-2 text-lg text-ink">{k.name}</dt>
                <dd className="text-sm text-stone">{k.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* What an administrator controls */}
      <section className="border-b hairline">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="eyebrow mb-2">The office</p>
            <h2 className="display max-w-[16ch] text-2xl text-ink">
              Everything a guest sees is edited by you, not by us
            </h2>
            <p className="mt-5 max-w-[34ch] text-ink-soft">
              No change request, no ticket, no waiting for a release. If the kitchen drops a dish at
              nine in the morning, it is off the menu by five past.
            </p>
          </div>
          <ul className="space-y-0">
            {ADMIN.map((item) => (
              <li key={item} className="border-t hairline py-4 text-sm text-ink-soft last:border-b">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Straight answers */}
      <section className="border-b hairline bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2 text-brass-soft">Straight answers</p>
          <h2 className="display mb-14 max-w-[20ch] text-2xl text-paper">
            What it does not do yet, said plainly
          </h2>

          <dl className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {HONEST.map((item) => (
              <div key={item.q} className="border-t border-paper/20 pt-6">
                <dt className="display mb-2 text-lg text-paper">{item.q}</dt>
                <dd className="text-sm leading-relaxed text-paper/70">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Close */}
      <section>
        <div className="mx-auto grid max-w-6xl items-end gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <h2 className="display max-w-[15ch] text-2xl text-ink">
              See it running against your own menu.
            </h2>
            <p className="mt-5 max-w-[34ch] text-ink-soft">
              Send us a service period and a handful of dishes. We will put them in and show you the
              guest journey and the kitchen queue.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <a
              href="mailto:hello@chosenworkflow.com?subject=5STAR demo request"
              className="eyebrow border border-ink bg-ink px-5 py-3 text-paper transition-colors hover:bg-transparent hover:text-ink"
            >
              Book a demo
            </a>
            <Link
              href="/solutions"
              className="eyebrow border-b border-brass pb-1 pt-2 text-ink transition-colors hover:text-brass-text"
            >
              All three products
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
