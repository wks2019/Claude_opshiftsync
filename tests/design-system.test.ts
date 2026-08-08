import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * The palette is declared in two places: the Tailwind @theme block that ships,
 * and MASTER.md that the design tooling reads. Nothing structural forces them
 * to agree, so this file does. It also computes real WCAG ratios rather than
 * trusting a list someone maintained by hand.
 */

const TOKENS = {
  ink: '#10201b',
  'ink-soft': '#2a3a34',
  paper: '#faf8f3',
  'paper-raised': '#ffffff',
  brass: '#a8894e',
  'brass-soft': '#c8b088',
  'brass-text': '#7d6535',
  stone: '#6b6a63',
  claret: '#7a2e2e',
  sage: '#547060',
} as const

/**
 * Files that still colour sub-18.66px text with `text-brass` (3.11:1, below the
 * 4.5:1 required by WCAG 1.4.3). All sit behind authentication, so none is on a
 * public page. This list must only ever shrink — adding to it is the failure
 * this test exists to prevent.
 */
const LEGACY = [
  'app/(dashboard)/admin/cms/page.tsx',
  'app/(dashboard)/admin/standards-engine/page.tsx',
  'app/(dashboard)/staff/certificates/page.tsx',
  'app/(dashboard)/staff/page.tsx',
  'app/(dashboard)/staff/simulations/page.tsx',
  'components/issue-certificate-form.tsx',
  'components/simulations-list.tsx',
  'components/sop-block-editor.tsx',
  'components/ui/button.tsx',
  'components/ui/field-hint.tsx',
  'modules/simulation-engine/components/simulation-player.tsx',
]

/** Matches `text-brass` / `hover:text-brass` as a whole class token. The lookbehind
 *  skips the arbitrary-variant selector `[&_.text-brass]`, which is a remap, not a
 *  colour; the lookahead skips `text-brass-soft` and `text-brass-text`. */
const BRASS_TEXT = /(?<![\w.-])(?:hover:)?text-brass(?![\w-])/
/** Tailwind sizes at or above 18.66px, where 3:1 is sufficient (WCAG 1.4.3 large text). */
const LARGE_TEXT = /text-(xl|2xl|3xl|4xl|5xl|6xl)/

function channel(hex: string, offset: number): number {
  const value = parseInt(hex.slice(offset, offset + 2), 16) / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hex: string): number {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5)
}

function contrast(a: string, b: string): number {
  const first = relativeLuminance(a)
  const second = relativeLuminance(b)
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)
  return (lighter + 0.05) / (darker + 0.05)
}

function sourceFiles(): string[] {
  return execSync("git ls-files '*.tsx' '*.ts'", { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter((file) => !file.startsWith('tests/'))
}

describe('design system', () => {
  it('declares every pinned token in globals.css', () => {
    const css = readFileSync('app/globals.css', 'utf8')
    for (const [name, hex] of Object.entries(TOKENS)) {
      expect(css, `--color-${name}`).toContain(`--color-${name}: ${hex};`)
    }
  })

  it('keeps MASTER.md in step with globals.css', () => {
    const master = readFileSync('design-system/chosen-workflow/MASTER.md', 'utf8').toLowerCase()
    for (const [name, hex] of Object.entries(TOKENS)) {
      expect(master, name).toContain(hex)
    }
  })

  it('meets WCAG 2.1 AA on every shipped pairing', () => {
    const normal: [string, string, string][] = [
      ['ink on paper', TOKENS.ink, TOKENS.paper],
      ['ink-soft on paper', TOKENS['ink-soft'], TOKENS.paper],
      ['stone on paper', TOKENS.stone, TOKENS.paper],
      ['brass-text on paper', TOKENS['brass-text'], TOKENS.paper],
      ['brass-soft on ink', TOKENS['brass-soft'], TOKENS.ink],
      ['paper on ink', TOKENS.paper, TOKENS.ink],
      ['paper on claret', TOKENS.paper, TOKENS.claret],
    ]
    for (const [label, fg, bg] of normal) {
      expect(contrast(fg, bg), label).toBeGreaterThanOrEqual(4.5)
    }
    // Non-text: focus ring, active underline, rules.
    expect(contrast(TOKENS.brass, TOKENS.paper), 'brass on paper').toBeGreaterThanOrEqual(3)
  })

  it('never colours small text with brass outside the legacy allowlist', () => {
    const offenders = sourceFiles().filter((file) => {
      if (LEGACY.includes(file)) return false
      return readFileSync(file, 'utf8')
        .split('\n')
        .some((line) => BRASS_TEXT.test(line) && !LARGE_TEXT.test(line))
    })
    expect(offenders, 'use text-brass-text for text below 18.66px').toEqual([])
  })

  it('has no stale entries in the legacy allowlist', () => {
    const stale = LEGACY.filter((file) => {
      const lines = readFileSync(file, 'utf8').split('\n')
      return !lines.some((line) => BRASS_TEXT.test(line) && !LARGE_TEXT.test(line))
    })
    expect(stale, 'remediated — remove from LEGACY').toEqual([])
  })
})
