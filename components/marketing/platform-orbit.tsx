import { PRODUCTS } from './products'

/** The three-product relationship, drawn once. Names are pulled from
 *  PRODUCTS so this can never disagree with the footer or /solutions about
 *  what a product is called; only the short orbit descriptor is local to
 *  this diagram, because "Guest Experience" is a caption for this picture,
 *  not the product's real one-line kind used everywhere else.
 *
 *  The 5STAR label sits above the ink centre circle, not on it: at the
 *  circle's own vertical centre the label was swallowed by the fill and
 *  became unreadable. */
const ORBIT_DESCRIPTOR: Record<string, string> = {
  '5star': 'Guest experience',
  academy: 'Employee capability',
  ops: 'Operational standards',
}

const [fiveStar, academy, ops] = PRODUCTS

export function PlatformOrbit() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm">
      <svg viewBox="0 0 320 320" className="h-full w-full" aria-hidden="true">
        <circle cx="160" cy="108" r="92" fill="none" stroke="var(--color-line-accent)" strokeOpacity="0.55" />
        <circle cx="98" cy="205" r="92" fill="none" stroke="var(--color-line-accent)" strokeOpacity="0.55" />
        <circle cx="222" cy="205" r="92" fill="none" stroke="var(--color-line-accent)" strokeOpacity="0.55" />
        <circle cx="160" cy="172" r="54" fill="var(--color-ink)" />
      </svg>

      <div className="absolute left-1/2 top-[19%] -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="eyebrow text-ink-soft">{fiveStar.name}</p>
        <p className="mt-1 text-[0.6875rem] text-stone">{ORBIT_DESCRIPTOR[fiveStar.slug]}</p>
      </div>
      <div className="absolute left-[24%] top-[64%] w-[9.5rem] -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="eyebrow text-ink-soft">{academy.name}</p>
        <p className="mt-1 text-[0.6875rem] text-stone">{ORBIT_DESCRIPTOR[academy.slug]}</p>
      </div>
      <div className="absolute left-[76%] top-[64%] w-[9.5rem] -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="eyebrow text-ink-soft">{ops.name}</p>
        <p className="mt-1 text-[0.6875rem] text-stone">{ORBIT_DESCRIPTOR[ops.slug]}</p>
      </div>
      <div className="absolute left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="eyebrow text-paper/80">Chosen</p>
        <p className="eyebrow text-paper/80">Workflow</p>
      </div>
    </div>
  )
}
