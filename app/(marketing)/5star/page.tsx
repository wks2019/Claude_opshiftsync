import type { Metadata } from 'next'
import Link from 'next/link'
import { DeviceShowcase } from '@/components/marketing/device-showcase'
import { Faq } from '@/components/marketing/faq'
import { FIVE_STAR_DEMO } from '@/components/marketing/demo'
import { FiveStarLockup } from '@/components/marketing/five-star-lockup'
import {
  IconBag,
  IconBarChart,
  IconBell,
  IconChefHat,
  IconClipboard,
  IconCloche,
  IconDevices,
  IconOpenBook,
  IconPhone,
  IconRoute,
  IconScan,
  IconShield,
  IconStar,
} from '@/components/marketing/icons'
import { IconSteps } from '@/components/marketing/icon-steps'
import { OrderTicket } from '@/components/marketing/order-ticket'
import { PlatformOrbit } from '@/components/marketing/platform-orbit'

export const metadata: Metadata = {
  title: '5STAR | Chosen Workflow',
  description:
    'In-room dining ordering. A card in the room, the menu on the guest\u2019s own phone, the order in your kitchen. No app to download and no phone call.',
}

const FEATURES = [
  {
    icon: IconDevices,
    title: 'No app download',
    body: 'Runs in the browser the guest already has. Nothing to install at eleven at night.',
  },
  {
    icon: IconOpenBook,
    title: 'Clear and accessible',
    body: 'Categories, dietary tags and prices set out plainly, on any device.',
  },
  {
    icon: IconRoute,
    title: 'From room to kitchen',
    body: 'An order goes straight to the kitchen queue. No call, no relay.',
  },
  {
    icon: IconShield,
    title: 'Secure and private',
    body: 'Every hotel\u2019s menus, rooms and orders are isolated at the database, not just the interface.',
  },
] as const

const JOURNEY = [
  {
    n: '01',
    icon: IconScan,
    title: 'Enter',
    body: 'The guest scans the card in the room. No app, no account, the browser they already have.',
  },
  {
    n: '02',
    icon: IconOpenBook,
    title: 'Explore',
    body: 'The menu for the hour they are in, breakfast, all day or overnight, with dietary tags on every dish.',
  },
  {
    n: '03',
    icon: IconCloche,
    title: 'Choose',
    body: 'Modifiers, allergens and prices, with the service charge already worked in.',
  },
  {
    n: '04',
    icon: IconBag,
    title: 'Order',
    body: 'One tap sends it to the kitchen queue. No dial tone, no hold music.',
  },
  {
    n: '05',
    icon: IconChefHat,
    title: 'Prepare',
    body: 'The kitchen sees it the moment it lands and moves it through new, preparing, on the way.',
  },
  {
    n: '06',
    icon: IconBell,
    title: 'Deliver',
    body: 'The guest watches the same states on their own phone, without calling down to ask.',
  },
] as const

const EXPERIENCE_POINTS = [
  'Service periods matched to your operation: breakfast, all day, overnight',
  'Clear categories and easy navigation across the whole menu',
  'Descriptions, prices and dietary information on every dish',
  'The same menu, legible on a phone, a tablet, or a kitchen screen',
] as const

const FLOW = [
  {
    n: '01',
    icon: IconBag,
    title: 'Guest order',
    body: 'Placed from the room, the room number checked against the surname on the reservation.',
  },
  {
    n: '02',
    icon: IconDevices,
    title: 'Order received',
    body: 'Appears on the kitchen screen the moment it is placed. Nothing to refresh.',
  },
  {
    n: '03',
    icon: IconChefHat,
    title: 'Prepare',
    body: 'One tap moves it to preparing. The guest sees the same state on their own phone.',
  },
  {
    n: '04',
    icon: IconBell,
    title: 'Ready',
    body: 'Marked on the way. The guest is told without a call down to the kitchen.',
  },
  {
    n: '05',
    icon: IconCloche,
    title: 'Deliver',
    body: 'Delivered closes the order. The kitchen queue and the guest\u2019s tracker both clear.',
  },
] as const

const BENEFITS = [
  {
    icon: IconPhone,
    title: 'Reduce telephone traffic',
    body: 'Guests browse and order independently, so Room Service isn\u2019t fielding calls for the menu itself.',
  },
  {
    icon: IconClipboard,
    title: 'Make information clear',
    body: 'Dietary tags, modifiers and prices in one consistent format, not read aloud over a phone line.',
  },
  {
    icon: IconChefHat,
    title: 'Support your kitchen',
    body: 'Orders arrive structured and complete, with nothing missed in translation.',
  },
  {
    icon: IconStar,
    title: 'A smoother guest moment',
    body: 'Deciding and ordering happen in one place, without the friction of a call.',
  },
  {
    icon: IconBarChart,
    title: 'See what\u2019s ordered',
    body: 'Every order is retained, so what guests actually choose stops being a guess.',
  },
] as const

const ACCESSIBILITY_POINTS = [
  'Clear headings and reading order',
  'High-contrast, legible type at every size',
  'Operable by keyboard, not just touch or a mouse',
  'Responsive from a phone screen to a kitchen tablet',
  'Status is never shown by colour alone',
] as const

const FAQ = [
  {
    q: 'Does the guest need to download an app?',
    a: 'No. 5STAR runs in the browser the guest already has. There is nothing to install and no account to create.',
  },
  {
    q: 'Will it work on any device?',
    a: 'Any phone with a camera and a browser is the whole requirement. Nothing is installed in the room.',
  },
  {
    q: 'Can the hotel control the menu?',
    a: 'Yes. Categories, items, prices, dietary tags and modifiers are all edited by your team in the admin CMS, with no release to wait for.',
  },
  {
    q: 'Can dietary information be displayed?',
    a: 'Yes, on every dish: gluten-free, vegetarian and any tag your kitchen uses, shown next to the item rather than buried in a footnote.',
  },
  {
    q: 'Can the menus change for breakfast, all day and overnight?',
    a: 'Yes. Service periods are set by your kitchen, and an item only appears on the menu during the hours it can actually be cooked.',
  },
  {
    q: 'Does it take payment?',
    a: 'Not yet. Orders post to the kitchen and are settled the way you settle them now, on the folio or at checkout.',
  },
  {
    q: 'Can guests order without calling Room Service?',
    a: 'Yes, that is the point. The call stays available for anyone who prefers it, but ordering no longer depends on it.',
  },
  {
    q: 'Does 5STAR integrate with the PMS or POS?',
    a: 'Not yet. Integration with Opera and Symphony is planned and we would rather say so than imply otherwise.',
  },
  {
    q: 'Is guest data secure?',
    a: 'Every menu, room and order belongs to one hotel, enforced at the database with Row Level Security rather than in application code.',
  },
  {
    q: 'Is 5STAR accessible for guests using screen readers?',
    a: 'It is built to the same high-contrast, structured-heading principles as the rest of Chosen Workflow. We describe this as a design commitment, not a certification we have not obtained.',
  },
  {
    q: 'Can 5STAR be customised for individual hotels?',
    a: 'Yes. Every hotel has its own menu, rooms and settings, isolated from every other hotel on the platform.',
  },
  {
    q: 'What do we need to install?',
    a: 'Nothing. Printed cards in the rooms and a browser on a kitchen screen or tablet.',
  },
] as const

export default function FiveStarPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b hairline">
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 pb-20 pt-20 lg:grid-cols-[1fr_0.95fr] lg:gap-14">
          <div>
            <FiveStarLockup subline="In-room dining ordering" />
            <h1 className="display mt-9 max-w-[15ch] text-[clamp(2.1rem,4.6vw,3.5rem)] leading-[1.1] text-ink">
              Digital in-room dining, designed around the hotel guest.
            </h1>
            <p className="mt-6 max-w-[42ch] text-lg text-ink-soft">
              5STAR gives hotel guests a simple way to browse the menu, understand their options
              and place an order, without needing to call Room Service.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <a
                href="#guest-experience"
                className="eyebrow border border-ink bg-ink px-5 py-3 text-paper transition-colors hover:bg-transparent hover:text-ink"
              >
                Explore the guest experience
              </a>
              <a
                href="mailto:hello@chosenworkflow.com?subject=5STAR demo request"
                className="eyebrow border border-brass px-5 py-3 text-brass-text transition-colors hover:bg-brass hover:text-ink"
              >
                Book a demo
              </a>
            </div>

            <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8">
              {FEATURES.map((f) => (
                <li key={f.title}>
                  <f.icon className="h-6 w-6 text-brass-text" />
                  <p className="display mt-3 text-sm text-ink">{f.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone">{f.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6 lg:pt-0">
            <DeviceShowcase />
            <p className="eyebrow mt-12 text-center lg:text-left">
              The real application. Room 204, Whitmore, The Marchmont.
            </p>
          </div>
        </div>
      </section>

      {/* Journey at a glance */}
      <section className="border-b hairline bg-paper-raised">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2">How the guest journey works</p>
          <h2 className="display mb-14 max-w-[22ch] text-2xl text-ink">
            Six steps, from the room to the kitchen and back
          </h2>
          <IconSteps steps={JOURNEY} />
        </div>
      </section>

      {/* The experience your guest sees */}
      <section id="guest-experience" className="scroll-mt-20 border-b hairline">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-2">This is the experience your guest sees</p>
            <h2 className="display mb-6 max-w-[18ch] text-2xl text-ink">
              A clear, accessible menu, designed to make ordering simple
            </h2>
            <ul className="space-y-3">
              {EXPERIENCE_POINTS.map((point) => (
                <li key={point} className="flex gap-3 text-sm text-ink-soft">
                  <span aria-hidden="true" className="text-brass-text">
                    &#10003;
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <a
              href={FIVE_STAR_DEMO.url}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow mt-8 inline-block border-b border-brass pb-1 pt-2 text-ink transition-colors hover:text-brass-text"
            >
              View the full experience
            </a>
          </div>
          <div className="overflow-hidden rounded-2xl border hairline shadow-[0_20px_50px_-24px_rgb(16_32_27_/_0.25)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/5star/guest-menu-tablet.png"
              alt="The 5STAR menu, showing service periods, categories, and the Oysters starter with its price and dietary tag"
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>

      {/* From menu to kitchen */}
      <section className="border-b hairline bg-paper-raised">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2">From menu to kitchen</p>
          <h2 className="display mb-3 max-w-[22ch] text-2xl text-ink">
            5STAR connects the guest to your existing kitchen workflow
          </h2>
          <p className="mb-14 max-w-[46ch] text-ink-soft">Clear orders. Fewer calls. Better service.</p>
          <IconSteps steps={FLOW} dense />
        </div>
      </section>

      {/* Try it yourself: the live demo */}
      <section className="border-b hairline">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div>
            <p className="eyebrow mb-2">Try it yourself</p>
            <h2 className="display max-w-[18ch] text-2xl text-ink">
              A working property, not a prototype behind a form
            </h2>
            <p className="mt-5 max-w-[36ch] text-ink-soft">
              This is the real application with a demonstration menu loaded. Order something. It
              will appear in a kitchen queue exactly as it would in yours.
            </p>
            <p className="mt-5 max-w-[36ch] text-sm text-stone">
              Best opened on a phone, which is where every guest will use it.
            </p>
          </div>

          <div className="border hairline bg-paper-raised p-7">
            <p className="eyebrow border-b hairline pb-4">Demonstration guest</p>
            <dl className="mt-1">
              <div className="flex items-baseline justify-between border-b hairline py-3.5">
                <dt className="text-sm text-ink-soft">Property</dt>
                <dd className="data text-sm text-ink">{FIVE_STAR_DEMO.property}</dd>
              </div>
              <div className="flex items-baseline justify-between border-b hairline py-3.5">
                <dt className="text-sm text-ink-soft">Room number</dt>
                <dd className="data text-lg text-ink">{FIVE_STAR_DEMO.room}</dd>
              </div>
              <div className="flex items-baseline justify-between py-3.5">
                <dt className="text-sm text-ink-soft">Surname on reservation</dt>
                <dd className="data text-sm text-ink">{FIVE_STAR_DEMO.surname}</dd>
              </div>
            </dl>
            <a
              href={FIVE_STAR_DEMO.url}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow mt-6 block border border-ink bg-ink px-5 py-3 text-center text-paper transition-colors hover:bg-transparent hover:text-ink"
            >
              Open the live demo
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b hairline bg-paper-raised">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow mb-2">Benefits for your hotel</p>
          <h2 className="display mb-14 max-w-[20ch] text-2xl text-ink">What changes on the ground</h2>
          <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-5">
            {BENEFITS.map((b) => (
              <div key={b.title} className="border-t-2 border-ink pt-5">
                <b.icon className="h-6 w-6 text-brass-text" />
                <h3 className="display mt-3 mb-2 text-base text-ink">{b.title}</h3>
                <p className="text-sm text-stone">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform context */}
      <section className="border-b hairline">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="eyebrow mb-2">5STAR within Chosen Workflow</p>
            <h2 className="display mb-6 max-w-[20ch] text-2xl text-ink">
              The guest-facing layer of a wider platform
            </h2>
            <p className="max-w-[40ch] text-ink-soft">
              5STAR is what a guest touches directly. Hospitality Academy builds the capability
              behind it, and Hospitality OPS holds the operational standard it runs on. One
              account, one record, one platform.
            </p>
            <Link
              href="/solutions"
              className="eyebrow mt-8 inline-block border-b border-brass pb-1 pt-2 text-ink transition-colors hover:text-brass-text"
            >
              Discover the platform
            </Link>
          </div>
          <PlatformOrbit />
        </div>
      </section>

      {/* Accessibility + FAQ */}
      <section className="border-b hairline bg-paper-raised">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div className="border border-ink bg-ink p-8 text-paper">
              <p className="eyebrow mb-3 text-brass-soft">Accessible by design</p>
              <h2 className="display mb-6 text-lg text-paper">
                Built for every guest, not just most of them
              </h2>
              <ul className="space-y-2.5">
                {ACCESSIBILITY_POINTS.map((point) => (
                  <li key={point} className="flex gap-3 text-sm text-paper/80">
                    <span aria-hidden="true" className="text-brass-soft">
                      &#10003;
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="eyebrow mb-2">Frequently asked questions</p>
              <h2 className="display mb-8 text-2xl text-ink">Straight answers</h2>
              <Faq items={FAQ} />
            </div>
          </div>
        </div>
      </section>

      {/* Close */}
      <section>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[0.8fr_1fr_auto] lg:gap-14">
          <OrderTicket />
          <div>
            <h2 className="display max-w-[16ch] text-2xl text-ink">
              See 5STAR running with your own menu.
            </h2>
            <p className="mt-5 max-w-[36ch] text-ink-soft">
              Send us a service period and a handful of dishes. We will build the experience
              around your menu and show you how the guest journey works, from room to kitchen.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <a
              href="mailto:hello@chosenworkflow.com?subject=5STAR demo request"
              className="eyebrow border border-ink bg-ink px-5 py-3 text-paper transition-colors hover:bg-transparent hover:text-ink"
            >
              Book a demo
            </a>
            <a
              href="mailto:hello@chosenworkflow.com?subject=Pricing enquiry"
              className="eyebrow border border-brass px-5 py-3 text-brass-text transition-colors hover:bg-brass hover:text-ink"
            >
              Get a quote
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
