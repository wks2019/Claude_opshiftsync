/** The three products, in one place, so the homepage, Solutions and the
 *  footer can never disagree about what they are called or what they do.
 *
 *  Naming is deliberate and inconsistent for a reason. 5STAR is a brand
 *  because it is the only one a guest ever sees. The other two are sold to
 *  professionals who want to know what the thing does, so they are described
 *  rather than branded. Never write "The Academy" or "Ops" in copy. */
export const PRODUCTS = [
  {
    slug: '5star',
    name: '5STAR',
    kind: 'Guest-facing',
    question: 'Can the guest get what they want, easily?',
    summary:
      'Apps the guest uses directly. In-room dining ordering is live: a QR code in the room, a menu on their own phone, an order in the kitchen. No app to download, no call to make.',
    status: 'In-room dining ordering, live. Housekeeping and concierge to follow.',
  },
  {
    slug: 'academy',
    name: 'Hospitality Academy',
    kind: 'Training',
    question: 'Does this person know the standard?',
    summary:
      'Courses, lessons, decision-based simulations and certificates, authored from your own standards. A new starter can finish a module inside a shift, and the certificate can be verified from outside the platform.',
    status: 'Courses, simulations, competencies, certificates.',
  },
  {
    slug: 'ops',
    name: 'Hospitality OPS',
    kind: 'Operations',
    question: 'Is the standard actually being followed?',
    summary:
      'The SOP system and staff testing. Versioned procedures your team reads mid-shift, and short assessments that prove competency is still current rather than something earned once and never checked again.',
    status: 'SOP library, staff testing.',
  },
] as const

export type Product = (typeof PRODUCTS)[number]
