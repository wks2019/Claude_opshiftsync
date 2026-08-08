# Chosen Workflow — Design System (Master)

> Source of truth. **Pinned, not generated.** Never regenerate with `--force`.
> Page-specific overrides live in `./pages/<page>.md` and take precedence over this file.
> Enforced by `tests/design-system.test.ts` — changing a value here without changing
> `app/globals.css` fails the build, and vice versa.

## Status: LOCKED

This palette ships in production. Do not propose alternatives, restyles, trend-led
substitutions, or "modernised" variants. The system is deliberate and complete.

## Colour tokens

| Role | Token | Value | Notes |
|---|---|---|---|
| Primary | `--color-ink` | `#10201b` | Buttons, headings, body. 15.87:1 on paper |
| On primary | `--color-paper` | `#faf8f3` | |
| Secondary | `--color-ink-soft` | `#2a3a34` | Standfirst, supporting prose. 11.39:1 |
| Accent — fills | `--color-brass` | `#a8894e` | Rules, borders, focus rings, service bar. **3.11:1 — never text below 18.66px** |
| Accent — text | `--color-brass-text` | `#7d6535` | 5.22:1 on paper. Every brass-coloured word uses this |
| Accent — on dark | `--color-brass-soft` | `#c8b088` | 8.01:1 on ink |
| Background | `--color-paper` | `#faf8f3` | |
| Card | `--color-paper-raised` | `#ffffff` | |
| Muted foreground | `--color-stone` | `#6b6a63` | 5.11:1 on paper |
| Border | `--color-hairline` | `rgb(140 140 132 / 0.25)` | Alpha by design. Composite over the surface behind it — do not substitute a solid hex |
| Destructive | `--color-claret` | `#7a2e2e` | Paper on claret 8.80:1 |
| Success | `--color-sage` | `#547060` | |
| Focus ring | `--color-brass` | `#a8894e` | 2px, 2px offset. Meets the 3:1 non-text minimum |

There is deliberately **no tinted panel or muted-background token.** Separation is
carried by a hairline rule on paper. Do not add one.

## Typography

| Face | Family | Use |
|---|---|---|
| Display | Marcellus 400, `0.04em` tracking | One element per screen, never more |
| Body | Hanken Grotesk 400/500/600 | Prose |
| Data / eyebrow | Spline Sans Mono, `0.6875rem`, `0.14em`, uppercase | Labels, figures, tabular numerals |

The root size should be relative, never an absolute pixel value — an absolute root
overrides the reader's own browser font-size preference. `globals.css` currently sets
`15px`; this is a known deviation, tracked with the remaining accessibility findings.

## Style

Flat. Hairline borders. Typographic hierarchy carries the design; decoration does not.
No shadows, no gradients, no blur, no glass, no background imagery behind text.
Performance budget: Lighthouse 95+, LCP under 2.0s. The home hero LCP element is the
`<h1>` and must stay text.

## Copy lexicon

| Concept | Canonical term | Never |
|---|---|---|
| Primary conversion | Book a demo | Request a demo, Get started, Learn more |
| Existing-property enquiry | Request access | Sign up, Register |
| Returning user | Sign in | Log in, Login |
| Commercial enquiry | Get a quote | Pricing enquiry, Contact sales |

Agreed but not yet applied in the codebase — tracked as a separate change.

## Anti-patterns — reject on sight

- Liquid Glass, glassmorphism, translucency, chromatic aberration
- Navy, blue, or any hue absent from the token table
- `text-brass` on anything below 18.66px (WCAG 1.4.3 failure at 3.11:1)
- A solid hex standing in for the alpha hairline
- Emoji as icons; drop shadows; hero background imagery
- Absolute `px` root font size
- Any change that risks the Lighthouse budget

## Skill routing

Skills below are **dormant** — they do not self-activate. Invoke them explicitly.

| When the task is | Use | Notes |
|---|---|---|
| Building or changing UI in this repo | `web-architect` + `frontend-design` | Auto-active. The default path |
| Reviewing UI before merge | `design:accessibility-review` | Run on every branch touching a public page |
| Naming a CTA, label, error, or empty state | `design:ux-copy` | Check the copy lexicon above first |
| Structured critique of a screen | `design:design-critique` | |
| A **new** product or sub-brand with no locked palette | `/uxpm` (`ui-ux-pro-max`) | **Never on Chosen Workflow surfaces.** Its generator returns Liquid Glass and a navy palette for this product type |
| A narrow lookup — font pairing candidates, chart type, stack pattern | `/uxpm --domain <domain>` | Single-domain query only, never `--design-system` |
| Its 98 UX guidelines as a review checklist | `/uxpm` references | Lowest-conflict use of that skill |
| Brand imagery | `cinema-world-builder` then `banana-pro-director` | Deferred by decision. Below the fold only, never the hero |

Any output originating from `ui-ux-pro-max` must be labelled as such so it can be rejected.
