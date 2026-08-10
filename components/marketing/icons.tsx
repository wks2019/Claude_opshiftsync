import type { SVGProps } from 'react'

/** A small, hand-drawn icon set for the marketing site.
 *
 *  The product has been entirely typographic until now, deliberately: no
 *  icon library is a dependency, and none of Tailwind's defaults match the
 *  brand's 1.5px hairline weight. These are drawn to that weight, on a 24px
 *  grid, stroke-only, currentColor, so they inherit ink or brass exactly like
 *  text does and never introduce a second visual language.
 *
 *  Add icons here, not from a library. Keep every path 1.5px stroke, no fill,
 *  rounded caps, so a new icon cannot read as a different hand. */

type IconProps = SVGProps<SVGSVGElement>

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function IconScan(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3" />
      <rect x="9" y="9" width="6" height="6" rx="0.5" />
    </svg>
  )
}

export function IconOpenBook(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 6.5c-1.6-1.2-3.6-1.7-6-1.5v12c2.4-.2 4.4.3 6 1.5 1.6-1.2 3.6-1.7 6-1.5v-12c-2.4-.2-4.4.3-6 1.5Z" />
      <path d="M12 6.5v12" />
    </svg>
  )
}

export function IconCloche(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 16a8 8 0 0 1 16 0" />
      <path d="M3 16h18M12 5v2" />
    </svg>
  )
}

export function IconBag(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  )
}

export function IconChefHat(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 19v-6.2A4 4 0 1 1 9.3 6a3.5 3.5 0 0 1 5.4 0A4 4 0 1 1 17 12.8V19" />
      <path d="M6 19h12" />
    </svg>
  )
}

export function IconBell(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5a5 5 0 0 0-5 5c0 4-1.5 5.5-1.5 5.5h13S17 14 17 10a5 5 0 0 0-5-5Z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function IconPhoneOff(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 5h5l1.5 4-2 1.5a9 9 0 0 0 4 4l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 6 6a2 2 0 0 1 2-2Z" />
      <path d="M4 4l16 16" />
    </svg>
  )
}

export function IconDevices(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="6" width="12" height="9" rx="1" />
      <path d="M17 9h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-1" />
    </svg>
  )
}

export function IconRoute(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M6 8v3a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3" />
    </svg>
  )
}

export function IconShield(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4l7 2.5v5c0 4.5-3 7.5-7 8.5-4-1-7-4-7-8.5v-5L12 4Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

export function IconPhone(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 4h3l1.5 4-2 1.5a9 9 0 0 0 4 4l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4 6a2 2 0 0 1 2-2Z" />
    </svg>
  )
}

export function IconClipboard(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="5" width="12" height="15" rx="1" />
      <path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 11h6M9 15h6" />
    </svg>
  )
}

export function IconStar(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4l2.2 5 5.3.5-4 3.6 1.2 5.4L12 15.9 7.3 18.5l1.2-5.4-4-3.6L9.8 9 12 4Z" />
    </svg>
  )
}

export function IconBarChart(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 20V11M12 20V6M19 20v-7" />
      <path d="M4 20h16" />
    </svg>
  )
}
