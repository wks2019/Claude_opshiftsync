import type { ComponentType, SVGProps } from 'react'

interface Step {
  n: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  body?: string
}

/** A numbered sequence of brass-ringed icons connected by a dotted rule.
 *
 *  Reserved for content that is genuinely ordered, a real process with a
 *  first and last step, not a set of features. The guest journey and the
 *  order flow both qualify: each step causes the next.
 *
 *  Numbers, icon, and connector all carry the same fact: this happens in
 *  this order. Removing any one of the three would not make the row wrong,
 *  only redundant, which is why it is normally just numbers (see the
 *  existing 01/02/03 treatment on the /solutions and /academy pages). This
 *  variant adds the ring and the icon because the row stands alone here as
 *  the page's one illustrative device, not a supporting list. */
export function IconSteps({ steps, dense = false }: { steps: readonly Step[]; dense?: boolean }) {
  return (
    <ol className={`grid gap-x-6 gap-y-12 sm:grid-cols-3 ${dense ? 'lg:grid-cols-5' : 'lg:grid-cols-6'}`}>
      {steps.map((step, i) => (
        <li key={step.n} className="relative text-center">
          {i < steps.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute left-[calc(50%+2.25rem)] top-6 hidden h-px w-[calc(100%-4.5rem)] border-t border-dotted border-brass-soft lg:block"
            />
          )}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-brass text-brass-text">
            <step.icon className="h-5 w-5" />
          </div>
          <p className="eyebrow mt-3 text-brass-text">{step.n}</p>
          <p className="display mt-1 text-base text-ink">{step.title}</p>
          {step.body && <p className="mx-auto mt-2 max-w-[22ch] text-sm text-stone">{step.body}</p>}
        </li>
      ))}
    </ol>
  )
}
