'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { FieldHint } from '@/components/ui/field-hint'

// CMS Engine editor for SOPs & Standards.
// Fixed compliance fields (Title, Standard) + document meta (header, doc
// info, scope, orientation) + flexible blocks (procedure, checklist, table,
// rating, field, media). Font choices are limited to the three brand fonts.
// New block type: extend FlexibleBlock, BLOCK_LABELS, createBlock, the API
// route's blockSchema, renderBlockFields() and renderBlockPreview().

type FlexibleBlockType = 'procedure' | 'checklist' | 'table' | 'rating' | 'field' | 'media'
type StyleTarget = 'title' | 'standard' | 'procedure' | 'checklist' | 'table'
type Orientation = 'portrait' | 'landscape'
type FieldType = 'text' | 'date' | 'time' | 'number' | 'signature'

interface SectionStyle {
  fontFamily: string
  fontSize: number
  textColor: string
}

interface ProcedureStep {
  title: string
  bullets: string[]
}

interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

interface RatingItem {
  id: string
  label: string
  stars: number
}

interface FieldItem {
  id: string
  label: string
  fieldType: FieldType
}

interface ProcedureBlock {
  id: string
  type: 'procedure'
  steps: ProcedureStep[]
}
interface ChecklistBlock {
  id: string
  type: 'checklist'
  items: ChecklistItem[]
}
interface TableBlock {
  id: string
  type: 'table'
  headers: string[]
  rows: string[][]
}
interface RatingBlock {
  id: string
  type: 'rating'
  items: RatingItem[]
}
interface FieldBlock {
  id: string
  type: 'field'
  items: FieldItem[]
}
interface MediaBlock {
  id: string
  type: 'media'
  content: string
  alt: string
  caption: string
}

type FlexibleBlock = ProcedureBlock | ChecklistBlock | TableBlock | RatingBlock | FieldBlock | MediaBlock

const BLOCK_LABELS: Record<FlexibleBlockType, string> = {
  procedure: 'Procedure',
  checklist: 'Checklist',
  table: 'Table',
  rating: 'Rating',
  field: 'Field',
  media: 'Media',
}

const FONT_OPTIONS = [
  { value: 'var(--font-display)', label: 'Marcellus (Display)' },
  { value: 'var(--font-body)', label: 'Hanken Grotesk (Body)' },
  { value: 'var(--font-data)', label: 'Spline Mono (Data)' },
]

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 30, 36]

// Brand palette swatches (ink, brass, sage, claret, stone).
const COLOR_SWATCHES = ['#10201b', '#a9812f', '#4d7c57', '#b34747', '#78716c']

const FIELD_TYPES: FieldType[] = ['text', 'date', 'time', 'number', 'signature']

const DEFAULT_STYLES: Record<StyleTarget, SectionStyle> = {
  title: { fontFamily: 'var(--font-display)', fontSize: 24, textColor: '#10201b' },
  standard: { fontFamily: 'var(--font-display)', fontSize: 14, textColor: '#10201b' },
  procedure: { fontFamily: 'var(--font-body)', fontSize: 14, textColor: '#10201b' },
  checklist: { fontFamily: 'var(--font-body)', fontSize: 14, textColor: '#10201b' },
  table: { fontFamily: 'var(--font-body)', fontSize: 13, textColor: '#10201b' },
}

interface HeaderMeta {
  companyName: string
  website: string
  address: string
  logoUrl: string
}

interface DocInfoMeta {
  sopNumber: string
  dateCreated: string
  implementationDate: string
  revisionNumber: string
  lastUpdated: string
  preparedBy: string
  showPreparedBy: boolean
}

const EMPTY_HEADER: HeaderMeta = { companyName: '', website: '', address: '', logoUrl: '' }
const EMPTY_DOC_INFO: DocInfoMeta = {
  sopNumber: '',
  dateCreated: '',
  implementationDate: '',
  revisionNumber: '',
  lastUpdated: '',
  preparedBy: '',
  showPreparedBy: false,
}

function createBlock(type: FlexibleBlockType): FlexibleBlock {
  const id = crypto.randomUUID()
  switch (type) {
    case 'procedure':
      return { id, type, steps: [{ title: '', bullets: [''] }] }
    case 'checklist':
      return { id, type, items: [{ id: crypto.randomUUID(), text: '', checked: false }] }
    case 'table':
      return { id, type, headers: ['Column 1', 'Column 2'], rows: [['', '']] }
    case 'rating':
      return { id, type, items: [{ id: crypto.randomUUID(), label: '', stars: 3 }] }
    case 'field':
      return { id, type, items: [{ id: crypto.randomUUID(), label: '', fieldType: 'text' }] }
    case 'media':
      return { id, type, content: '', alt: '', caption: '' }
  }
}

interface Template {
  name: string
  desc: string
  title: string
  standard: string
  scope: string
  blocks: () => FlexibleBlock[]
}

const TEMPLATES: Template[] = [
  {
    name: 'Table Setup',
    desc: 'Procedure steps for laying a table.',
    title: 'Table Setup',
    standard: 'Tables must be set precisely to luxury standards to ensure guest comfort.',
    scope: 'Applies to all front-of-house staff preparing the dining room before service.',
    blocks: () => [
      {
        id: crypto.randomUUID(),
        type: 'procedure',
        steps: [
          { title: 'Charger Placement', bullets: ['Place the charger plate centred.'] },
          { title: 'Cutlery Alignment', bullets: ['Align the knife two centimetres from the edge.'] },
          { title: 'Napkin Fold', bullets: ['Fold the napkin into a crisp triangle.'] },
        ],
      },
    ],
  },
  {
    name: 'Opening Checklist',
    desc: 'Pre-service checklist for opening shift.',
    title: 'Opening Checklist',
    standard: 'All opening tasks must be completed and verified before doors open to guests.',
    scope: 'Applies to opening-shift staff across all outlets.',
    blocks: () => [
      {
        id: crypto.randomUUID(),
        type: 'checklist',
        items: ['Turn on all lighting zones', 'Check reservation list', 'Polish glassware', 'Set ambient music'].map(
          (text) => ({ id: crypto.randomUUID(), text, checked: false })
        ),
      },
      {
        id: crypto.randomUUID(),
        type: 'procedure',
        steps: [{ title: 'Final walk-through', bullets: ['Verify every checklist item before opening the doors.'] }],
      },
    ],
  },
  {
    name: 'Kitchen HACCP Check',
    desc: 'Food safety temperature and hygiene log.',
    title: 'Kitchen HACCP Check',
    standard: 'Critical control points must be checked and recorded at every shift to maintain food safety compliance.',
    scope: 'Applies to all kitchen staff on duty. Records retained per food safety policy.',
    blocks: () => [
      {
        id: crypto.randomUUID(),
        type: 'table',
        headers: ['Control Point', 'Standard', 'Reading', 'Action if Failed'],
        rows: [
          ['Fridge temperature', '0-5 C', '', 'Report to head chef, move stock'],
          ['Freezer temperature', '-18 C or below', '', 'Report to head chef, move stock'],
          ['Hot holding', '63 C or above', '', 'Discard after 2 hours'],
        ],
      },
      {
        id: crypto.randomUUID(),
        type: 'procedure',
        steps: [{ title: 'Recording', bullets: ['Log every reading at shift start and shift end.'] }],
      },
      {
        id: crypto.randomUUID(),
        type: 'field',
        items: [
          { id: crypto.randomUUID(), label: 'Checked by', fieldType: 'signature' },
          { id: crypto.randomUUID(), label: 'Date', fieldType: 'date' },
        ],
      },
    ],
  },
  {
    name: 'VIP Arrival',
    desc: 'Pre-arrival and welcome procedure for VIP guests.',
    title: 'VIP Arrival',
    standard: 'VIP guests must experience a flawless, personalised arrival reflecting the highest brand standards.',
    scope: 'Applies to front office, butler service, and housekeeping for flagged VIP arrivals.',
    blocks: () => [
      {
        id: crypto.randomUUID(),
        type: 'procedure',
        steps: [
          {
            title: 'Pre-Arrival',
            bullets: ['Review guest profile, preferences, and history.', 'Inspect the room against VIP amenity standards.'],
          },
          {
            title: 'Arrival',
            bullets: ['Greet by name at the entrance with the duty manager.', 'Escort directly to the room; complete in-room check-in.'],
          },
          {
            title: 'Follow-Up',
            bullets: ['Courtesy contact within two hours of arrival.', 'Log preferences observed for future stays.'],
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: 'rating',
        items: [{ id: crypto.randomUUID(), label: 'Arrival experience delivered to standard', stars: 5 }],
      },
    ],
  },
]

export function SopBlockEditor() {
  const router = useRouter()
  const { showToast } = useToast()

  const [title, setTitle] = useState('')
  const [standard, setStandard] = useState('')
  const [scope, setScope] = useState('')
  const [header, setHeader] = useState<HeaderMeta>(EMPTY_HEADER)
  const [docInfo, setDocInfo] = useState<DocInfoMeta>(EMPTY_DOC_INFO)
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [blocks, setBlocks] = useState<FlexibleBlock[]>([createBlock('procedure')])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [styleTarget, setStyleTarget] = useState<StyleTarget>('title')
  const [styles, setStyles] = useState<Record<StyleTarget, SectionStyle>>(DEFAULT_STYLES)

  const currentStyle = styles[styleTarget]
  const updateCurrentStyle = (patch: Partial<SectionStyle>) =>
    setStyles((prev) => ({ ...prev, [styleTarget]: { ...prev[styleTarget], ...patch } }))

  const addBlock = (type: FlexibleBlockType) => setBlocks((prev) => [...prev, createBlock(type)])

  const updateBlock = (id: string, patch: Partial<FlexibleBlock>) =>
    setBlocks((prev) => prev.map((b) => (b.id === id ? ({ ...b, ...patch } as FlexibleBlock) : b)))

  const deleteBlock = (id: string) => setBlocks((prev) => prev.filter((b) => b.id !== id))

  const moveBlock = (id: string, direction: -1 | 1) =>
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === id)
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const current = prev[index]
      const swapWith = prev[target]
      if (!current || !swapWith) return prev
      const next = [...prev]
      next[index] = swapWith
      next[target] = current
      return next
    })

  const applyTemplate = (tpl: Template) => {
    setTitle(tpl.title)
    setStandard(tpl.standard)
    setScope(tpl.scope)
    setBlocks(tpl.blocks())
    setShowTemplates(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/v1/admin/sops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          standard,
          blocks,
          meta: { header, docInfo, scope, orientation, styles },
        }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not create the SOP')
      }
      setTitle('')
      setStandard('')
      setScope('')
      setHeader(EMPTY_HEADER)
      setDocInfo(EMPTY_DOC_INFO)
      setBlocks([createBlock('procedure')])
      router.refresh()
      showToast('SOP created.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the SOP')
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ---------- Editor fields per block type ---------- */

  const renderBlockFields = (block: FlexibleBlock) => {
    switch (block.type) {
      case 'procedure':
        return (
          <div className="space-y-3">
            {block.steps.map((step, si) => (
              <div key={si} className="border hairline p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="data w-5 shrink-0 text-stone">{String(si + 1).padStart(2, '0')}</span>
                  <Input
                    dense
                    placeholder="Step title"
                    value={step.title}
                    onChange={(e) => {
                      const steps = block.steps.map((s, i) => (i === si ? { ...s, title: e.target.value } : s))
                      updateBlock(block.id, { steps } as Partial<ProcedureBlock>)
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => updateBlock(block.id, { steps: block.steps.filter((_, i) => i !== si) } as Partial<ProcedureBlock>)}
                    className="text-stone transition-colors hover:text-claret"
                    aria-label="Remove step"
                  >
                    &times;
                  </button>
                </div>
                {step.bullets.map((bullet, bi) => (
                  <div key={bi} className="mb-1.5 flex items-center gap-2 pl-7">
                    <Input
                      dense
                      placeholder="Bullet point"
                      value={bullet}
                      onChange={(e) => {
                        const steps = block.steps.map((s, i) =>
                          i === si ? { ...s, bullets: s.bullets.map((b, j) => (j === bi ? e.target.value : b)) } : s
                        )
                        updateBlock(block.id, { steps } as Partial<ProcedureBlock>)
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (step.bullets.length <= 1) return
                        const steps = block.steps.map((s, i) =>
                          i === si ? { ...s, bullets: s.bullets.filter((_, j) => j !== bi) } : s
                        )
                        updateBlock(block.id, { steps } as Partial<ProcedureBlock>)
                      }}
                      className="text-stone transition-colors hover:text-claret"
                      aria-label="Remove bullet"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="subtle"
                  tone="brass"
                  onClick={() => {
                    const steps = block.steps.map((s, i) => (i === si ? { ...s, bullets: [...s.bullets, ''] } : s))
                    updateBlock(block.id, { steps } as Partial<ProcedureBlock>)
                  }}
                >
                  + Add bullet
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="subtle"
              tone="brass"
              onClick={() => updateBlock(block.id, { steps: [...block.steps, { title: '', bullets: [''] }] } as Partial<ProcedureBlock>)}
            >
              + Add step
            </Button>
          </div>
        )

      case 'checklist':
        return (
          <div className="space-y-2">
            {block.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      items: block.items.map((it) => (it.id === item.id ? { ...it, checked: e.target.checked } : it)),
                    } as Partial<ChecklistBlock>)
                  }
                />
                <Input
                  dense
                  placeholder="Checklist item"
                  value={item.text}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      items: block.items.map((it) => (it.id === item.id ? { ...it, text: e.target.value } : it)),
                    } as Partial<ChecklistBlock>)
                  }
                />
                <button
                  type="button"
                  onClick={() => updateBlock(block.id, { items: block.items.filter((it) => it.id !== item.id) } as Partial<ChecklistBlock>)}
                  className="text-stone transition-colors hover:text-claret"
                  aria-label="Remove item"
                >
                  &times;
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="subtle"
              tone="brass"
              onClick={() =>
                updateBlock(block.id, {
                  items: [...block.items, { id: crypto.randomUUID(), text: '', checked: false }],
                } as Partial<ChecklistBlock>)
              }
            >
              + Add item
            </Button>
          </div>
        )

      case 'table':
        return (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              {block.headers.map((h, ci) => (
                <Input
                  key={ci}
                  dense
                  placeholder="Header"
                  value={h}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      headers: block.headers.map((x, i) => (i === ci ? e.target.value : x)),
                    } as Partial<TableBlock>)
                  }
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  if (block.headers.length <= 1) return
                  updateBlock(block.id, {
                    headers: block.headers.slice(0, -1),
                    rows: block.rows.map((r) => r.slice(0, -1)),
                  } as Partial<TableBlock>)
                }}
                className="text-stone transition-colors hover:text-claret"
                aria-label="Remove last column"
              >
                &times;
              </button>
            </div>
            {block.rows.map((row, ri) => (
              <div key={ri} className="flex items-center gap-1.5">
                {row.map((cell, ci) => (
                  <Input
                    key={ci}
                    dense
                    value={cell}
                    onChange={(e) =>
                      updateBlock(block.id, {
                        rows: block.rows.map((r, i) => (i === ri ? r.map((c, j) => (j === ci ? e.target.value : c)) : r)),
                      } as Partial<TableBlock>)
                    }
                  />
                ))}
                <button
                  type="button"
                  onClick={() => {
                    if (block.rows.length <= 1) return
                    updateBlock(block.id, { rows: block.rows.filter((_, i) => i !== ri) } as Partial<TableBlock>)
                  }}
                  className="text-stone transition-colors hover:text-claret"
                  aria-label="Remove row"
                >
                  &times;
                </button>
              </div>
            ))}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="subtle"
                tone="brass"
                onClick={() => updateBlock(block.id, { rows: [...block.rows, block.headers.map(() => '')] } as Partial<TableBlock>)}
              >
                + Add row
              </Button>
              <Button
                type="button"
                variant="subtle"
                tone="brass"
                onClick={() =>
                  updateBlock(block.id, {
                    headers: [...block.headers, `Column ${block.headers.length + 1}`],
                    rows: block.rows.map((r) => [...r, '']),
                  } as Partial<TableBlock>)
                }
              >
                + Add column
              </Button>
            </div>
          </div>
        )

      case 'rating':
        return (
          <div className="space-y-2">
            {block.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <Input
                  dense
                  placeholder="Skill or standard"
                  value={item.label}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      items: block.items.map((it) => (it.id === item.id ? { ...it, label: e.target.value } : it)),
                    } as Partial<RatingBlock>)
                  }
                />
                <select
                  value={item.stars}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      items: block.items.map((it) => (it.id === item.id ? { ...it, stars: parseInt(e.target.value, 10) } : it)),
                    } as Partial<RatingBlock>)
                  }
                  className="border-b hairline bg-transparent py-1.5 text-sm text-ink outline-none focus:border-brass"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}&#9733;
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => updateBlock(block.id, { items: block.items.filter((it) => it.id !== item.id) } as Partial<RatingBlock>)}
                  className="text-stone transition-colors hover:text-claret"
                  aria-label="Remove rating"
                >
                  &times;
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="subtle"
              tone="brass"
              onClick={() =>
                updateBlock(block.id, {
                  items: [...block.items, { id: crypto.randomUUID(), label: '', stars: 3 }],
                } as Partial<RatingBlock>)
              }
            >
              + Add rating
            </Button>
          </div>
        )

      case 'field':
        return (
          <div className="space-y-2">
            {block.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <Input
                  dense
                  placeholder="Field label"
                  value={item.label}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      items: block.items.map((it) => (it.id === item.id ? { ...it, label: e.target.value } : it)),
                    } as Partial<FieldBlock>)
                  }
                />
                <select
                  value={item.fieldType}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      items: block.items.map((it) => (it.id === item.id ? { ...it, fieldType: e.target.value as FieldType } : it)),
                    } as Partial<FieldBlock>)
                  }
                  className="border-b hairline bg-transparent py-1.5 text-sm text-ink outline-none focus:border-brass"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => updateBlock(block.id, { items: block.items.filter((it) => it.id !== item.id) } as Partial<FieldBlock>)}
                  className="text-stone transition-colors hover:text-claret"
                  aria-label="Remove field"
                >
                  &times;
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="subtle"
              tone="brass"
              onClick={() =>
                updateBlock(block.id, {
                  items: [...block.items, { id: crypto.randomUUID(), label: '', fieldType: 'text' }],
                } as Partial<FieldBlock>)
              }
            >
              + Add field
            </Button>
          </div>
        )

      case 'media':
        return (
          <div className="space-y-2">
            <Input dense placeholder="Image URL" value={block.content} onChange={(e) => updateBlock(block.id, { content: e.target.value } as Partial<MediaBlock>)} />
            <Input dense placeholder="Alt text" value={block.alt} onChange={(e) => updateBlock(block.id, { alt: e.target.value } as Partial<MediaBlock>)} />
            <Input dense placeholder="Caption" value={block.caption} onChange={(e) => updateBlock(block.id, { caption: e.target.value } as Partial<MediaBlock>)} />
          </div>
        )
    }
  }

  /* ---------- Preview per block type ---------- */

  const renderBlockPreview = (block: FlexibleBlock) => {
    switch (block.type) {
      case 'procedure': {
        const steps = block.steps.filter((s) => s.title.trim() || s.bullets.some((b) => b.trim()))
        if (steps.length === 0) return null
        return (
          <div key={block.id} className="mb-8">
            <p className="eyebrow mb-3">Procedure</p>
            <div
              className={orientation === 'landscape' ? 'grid grid-cols-2 gap-x-8 gap-y-5' : 'space-y-5'}
              style={{ fontSize: styles.procedure.fontSize, color: styles.procedure.textColor, fontFamily: styles.procedure.fontFamily }}
            >
              {steps.map((step, i) => (
                <div key={i}>
                  <p className="data mb-2 text-brass">
                    {String(i + 1).padStart(2, '0')} · {step.title.trim() || 'Untitled step'}
                  </p>
                  <ul className="space-y-1.5">
                    {step.bullets
                      .filter((b) => b.trim())
                      .map((bullet, bi) => (
                        <li key={bi} className="flex gap-2">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-stone" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )
      }

      case 'checklist': {
        const items = block.items.filter((it) => it.text.trim())
        if (items.length === 0) return null
        return (
          <div key={block.id} className="mb-8">
            <p className="eyebrow mb-3">Checklist</p>
            <ul className="space-y-2" style={{ fontSize: styles.checklist.fontSize, color: styles.checklist.textColor, fontFamily: styles.checklist.fontFamily }}>
              {items.map((item) => (
                <li key={item.id} className={item.checked ? 'text-stone line-through' : ''}>
                  {item.checked ? '☑' : '☐'} {item.text}
                </li>
              ))}
            </ul>
          </div>
        )
      }

      case 'table': {
        const hasContent = block.headers.some((h) => h.trim()) || block.rows.some((r) => r.some((c) => c.trim()))
        if (!hasContent) return null
        return (
          <div key={block.id} className="mb-8">
            <p className="eyebrow mb-3">Table</p>
            <div className="overflow-hidden border hairline">
              <table
                className="w-full border-collapse"
                style={{ fontSize: styles.table.fontSize, color: styles.table.textColor, fontFamily: styles.table.fontFamily }}
              >
                <thead>
                  <tr>
                    {block.headers.map((h, i) => (
                      <th key={i} className="eyebrow border-b hairline bg-paper px-3 py-2 text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} className={`px-3 py-2 ${ri < block.rows.length - 1 ? 'border-b hairline' : ''}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }

      case 'rating': {
        const items = block.items.filter((it) => it.label.trim())
        if (items.length === 0) return null
        return (
          <div key={block.id} className="mb-8">
            <p className="eyebrow mb-3">Competency</p>
            <div className="space-y-2" style={{ fontSize: styles.checklist.fontSize, color: styles.checklist.textColor, fontFamily: styles.checklist.fontFamily }}>
              {items.map((item) => (
                <div key={item.id} className="flex items-baseline justify-between gap-4">
                  <span>{item.label}</span>
                  <span className="data tracking-widest text-brass">
                    {'★'.repeat(item.stars)}
                    {'☆'.repeat(5 - item.stars)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      }

      case 'field': {
        const items = block.items.filter((it) => it.label.trim())
        if (items.length === 0) return null
        return (
          <div key={block.id} className="mb-8">
            <p className="eyebrow mb-3">Record</p>
            <div className="space-y-3.5" style={{ fontSize: styles.checklist.fontSize, color: styles.checklist.textColor, fontFamily: styles.checklist.fontFamily }}>
              {items.map((item) => (
                <div key={item.id} className="flex items-baseline gap-3">
                  <span className="shrink-0">{item.label}</span>
                  <span className="min-h-[18px] flex-1 border-b border-stone" />
                  <span className="data shrink-0 text-[9px] uppercase tracking-widest text-stone">{item.fieldType}</span>
                </div>
              ))}
            </div>
          </div>
        )
      }

      case 'media':
        return block.content.trim() ? (
          <div key={block.id} className="mb-8 border hairline">
            <img src={block.content} alt={block.alt || 'SOP media'} className="block w-full" />
            {block.caption.trim() && <p className="border-t hairline p-2.5 text-xs italic text-stone">{block.caption}</p>}
          </div>
        ) : null
    }
  }

  /* ---------- Document meta preview helpers ---------- */

  const hasHeader = !!(header.companyName.trim() || header.website.trim() || header.address.trim() || header.logoUrl.trim())
  const metaFields: [string, string][] = [
    ['SOP Number', docInfo.sopNumber],
    ['Date Created', docInfo.dateCreated],
    ...(docInfo.showPreparedBy ? ([['Prepared By', docInfo.preparedBy]] as [string, string][]) : []),
    ['Implementation Date', docInfo.implementationDate],
    ['Revision Number', docInfo.revisionNumber],
    ['Last Updated', docInfo.lastUpdated],
  ]
  const filledMeta = metaFields.filter(([, v]) => v.trim())

  return (
    <div className={`grid gap-10 ${orientation === 'landscape' ? 'xl:grid-cols-[2fr_3fr]' : 'lg:grid-cols-2'}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4">
          <Button type="button" variant="subtle" tone="brass" onClick={() => setShowTemplates((v) => !v)}>
            {showTemplates ? 'Close templates' : 'Templates'}
          </Button>
          <div className="flex overflow-hidden border hairline" role="group" aria-label="Document orientation">
            {(['portrait', 'landscape'] as Orientation[]).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOrientation(o)}
                className={`px-4 py-1.5 text-xs uppercase tracking-wide transition-colors ${
                  orientation === o ? 'bg-ink text-paper' : 'text-stone hover:text-ink'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        {showTemplates && (
          <div className="grid gap-2 border hairline p-4 sm:grid-cols-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.name}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className="border hairline p-3 text-left transition-colors hover:border-brass"
              >
                <p className="mb-1 text-sm font-medium text-ink">{tpl.name}</p>
                <p className="text-xs text-stone">{tpl.desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* Header */}
        <details className="border hairline p-4">
          <summary className="eyebrow cursor-pointer">Company header (optional)</summary>
          <div className="mt-4 space-y-3">
            <Input dense placeholder="Company name" value={header.companyName} onChange={(e) => setHeader((p) => ({ ...p, companyName: e.target.value }))} />
            <Input dense placeholder="Logo URL" value={header.logoUrl} onChange={(e) => setHeader((p) => ({ ...p, logoUrl: e.target.value }))} />
            <Input dense placeholder="Website" value={header.website} onChange={(e) => setHeader((p) => ({ ...p, website: e.target.value }))} />
            <Input dense placeholder="Address" value={header.address} onChange={(e) => setHeader((p) => ({ ...p, address: e.target.value }))} />
          </div>
        </details>

        {/* Document info */}
        <details className="border hairline p-4">
          <summary className="eyebrow cursor-pointer">Document info (optional)</summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input dense placeholder="SOP number, e.g. #001" value={docInfo.sopNumber} onChange={(e) => setDocInfo((p) => ({ ...p, sopNumber: e.target.value }))} />
            <Input dense placeholder="Date created" value={docInfo.dateCreated} onChange={(e) => setDocInfo((p) => ({ ...p, dateCreated: e.target.value }))} />
            <Input dense placeholder="Implementation date" value={docInfo.implementationDate} onChange={(e) => setDocInfo((p) => ({ ...p, implementationDate: e.target.value }))} />
            <Input dense placeholder="Revision number" value={docInfo.revisionNumber} onChange={(e) => setDocInfo((p) => ({ ...p, revisionNumber: e.target.value }))} />
            <Input dense placeholder="Last updated" value={docInfo.lastUpdated} onChange={(e) => setDocInfo((p) => ({ ...p, lastUpdated: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={docInfo.showPreparedBy}
                onChange={(e) => setDocInfo((p) => ({ ...p, showPreparedBy: e.target.checked }))}
              />
              Show &quot;Prepared By&quot;
            </label>
            {docInfo.showPreparedBy && (
              <Input dense placeholder="Prepared by" value={docInfo.preparedBy} onChange={(e) => setDocInfo((p) => ({ ...p, preparedBy: e.target.value }))} />
            )}
          </div>
        </details>

        {/* Content */}
        <div>
          <label htmlFor="sopTitle" className="eyebrow mb-1.5 block">
            Title
            <FieldHint example="In-Room Dining: Breakfast Delivery" />
          </label>
          <Input id="sopTitle" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <label htmlFor="sopStandard" className="eyebrow mb-1.5 block">
            Standard
            <FieldHint example="Breakfast trays are delivered within the confirmed window, silver service, tray presented before curtains or lighting are adjusted." />
          </label>
          <Textarea id="sopStandard" rows={3} required value={standard} onChange={(e) => setStandard(e.target.value)} />
        </div>

        <div>
          <label htmlFor="sopScope" className="eyebrow mb-1.5 block">
            Scope
            <FieldHint example="Applies to all front-of-house staff during breakfast service. Optional." />
          </label>
          <Textarea id="sopScope" rows={2} value={scope} onChange={(e) => setScope(e.target.value)} />
        </div>

        {/* Style */}
        <div className="border hairline p-4">
          <p className="eyebrow mb-3">Style</p>
          <div className="space-y-3">
            <div>
              <label className="eyebrow mb-1.5 block">Section</label>
              <select
                value={styleTarget}
                onChange={(e) => setStyleTarget(e.target.value as StyleTarget)}
                className="w-full border-b hairline bg-transparent py-2 text-ink outline-none focus:border-brass"
              >
                <option value="title">Title</option>
                <option value="standard">Standard</option>
                <option value="procedure">Procedure</option>
                <option value="checklist">Checklist</option>
                <option value="table">Table</option>
              </select>
            </div>
            <div>
              <label className="eyebrow mb-1.5 block">Font family</label>
              <select
                value={currentStyle.fontFamily}
                onChange={(e) => updateCurrentStyle({ fontFamily: e.target.value })}
                className="w-full border-b hairline bg-transparent py-2 text-ink outline-none focus:border-brass"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="eyebrow mb-1.5 block">Font size</label>
              <select
                value={currentStyle.fontSize}
                onChange={(e) => updateCurrentStyle({ fontSize: parseInt(e.target.value, 10) })}
                className="w-full border-b hairline bg-transparent py-2 text-ink outline-none focus:border-brass"
              >
                {FONT_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}px
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="eyebrow">Text colour</label>
              <div className="flex gap-2">
                {COLOR_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => updateCurrentStyle({ textColor: hex })}
                    className={`h-6 w-6 rounded-full border-2 transition-colors ${
                      currentStyle.textColor === hex ? 'border-brass' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: hex, outline: '1px solid var(--color-hairline, #e7e5e4)', outlineOffset: '-1px' }}
                    aria-label={`Set colour ${hex}`}
                  />
                ))}
              </div>
              <input
                type="color"
                value={currentStyle.textColor}
                onChange={(e) => updateCurrentStyle({ textColor: e.target.value })}
                className="h-6 w-8 cursor-pointer border hairline"
                aria-label="Custom colour"
              />
            </div>
          </div>
        </div>

        {/* Blocks */}
        <div>
          <p className="eyebrow mb-1">Add block</p>
          <p className="mb-2 text-xs text-stone">Blocks appear on the document in order. Use the arrows on each block to reorder.</p>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(BLOCK_LABELS) as FlexibleBlockType[]).map((type) => (
              <Button key={type} type="button" variant="subtle" tone="brass" onClick={() => addBlock(type)}>
                + {BLOCK_LABELS[type]}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div key={block.id} className="border hairline p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="eyebrow">{BLOCK_LABELS[block.type]}</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => moveBlock(block.id, -1)} disabled={index === 0} className="text-stone transition-colors hover:text-ink disabled:opacity-30" aria-label="Move up">
                    ↑
                  </button>
                  <button type="button" onClick={() => moveBlock(block.id, 1)} disabled={index === blocks.length - 1} className="text-stone transition-colors hover:text-ink disabled:opacity-30" aria-label="Move down">
                    ↓
                  </button>
                  <button type="button" onClick={() => deleteBlock(block.id)} className="text-stone transition-colors hover:text-claret" aria-label="Delete block">
                    &times;
                  </button>
                </div>
              </div>
              {renderBlockFields(block)}
            </div>
          ))}
          {blocks.length === 0 && (
            <p className="border hairline border-dashed p-4 text-center text-xs text-stone">
              No blocks yet. Add a Procedure, Checklist, Table, Rating, Field or Media block above, or pick a template.
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-claret">
            {error}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} loadingLabel="Creating…">
          Create SOP
        </Button>
      </form>

      {/* Preview */}
      <div className={`h-fit border hairline bg-paper-raised ${orientation === 'landscape' ? 'p-10' : 'mx-auto w-full max-w-md p-8'}`}>
        <p className="eyebrow mb-4">Preview · {orientation}</p>

        {hasHeader && (
          <div className="mb-6 flex items-start justify-between gap-4 border-b hairline pb-4">
            <div className="flex items-center gap-2.5">
              <span className="block h-8 w-8 shrink-0 overflow-hidden bg-brass">
                {header.logoUrl.trim() && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={header.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                )}
              </span>
              <span className="display text-sm text-ink">{header.companyName}</span>
            </div>
            <p className="whitespace-pre-line text-right text-[11px] leading-relaxed text-stone">
              {[header.website, header.address].filter(Boolean).join('\n')}
            </p>
          </div>
        )}

        <h2
          className="display mb-6 border-b hairline pb-4 text-ink"
          style={{ fontSize: styles.title.fontSize, color: styles.title.textColor, fontFamily: styles.title.fontFamily }}
        >
          {title || 'Untitled standard'}
        </h2>

        {filledMeta.length > 0 && (
          <div className="mb-8 grid grid-cols-3 gap-x-3 gap-y-3.5 border-y hairline py-4">
            {filledMeta.map(([label, value]) => (
              <div key={label}>
                <p className="eyebrow mb-0.5 text-[9px]">{label}</p>
                <p className="text-[13px] text-ink-soft">{value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mb-8">
          <p className="eyebrow mb-2">Purpose</p>
          <p
            className="italic"
            style={{ fontSize: styles.standard.fontSize, color: styles.standard.textColor, fontFamily: styles.standard.fontFamily }}
          >
            {standard || 'No standard set.'}
          </p>
        </div>

        {scope.trim() && (
          <div className="mb-8">
            <p className="eyebrow mb-2">Scope</p>
            <p
              className="italic"
              style={{ fontSize: styles.standard.fontSize, color: styles.standard.textColor, fontFamily: styles.standard.fontFamily }}
            >
              {scope}
            </p>
          </div>
        )}

        {blocks.map(renderBlockPreview)}
      </div>
    </div>
  )
}
