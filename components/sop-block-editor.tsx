'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { FieldHint } from '@/components/ui/field-hint'

// Flexible block schema, mirrors app/api/v1/admin/sops/route.ts.
// New block type: add here, add a case in renderBlockFields() and
// renderBlockPreview(), add a case in the API route's deriveSteps/blockSchema
// if it should feed compliance scoring.

type FlexibleBlockType = 'procedure' | 'checklist' | 'media'

interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

interface ProcedureBlock {
  id: string
  type: 'procedure'
  steps: string[]
}

interface ChecklistBlock {
  id: string
  type: 'checklist'
  items: ChecklistItem[]
}

interface MediaBlock {
  id: string
  type: 'media'
  content: string
  alt: string
  caption: string
}

type FlexibleBlock = ProcedureBlock | ChecklistBlock | MediaBlock

const BLOCK_LABELS: Record<FlexibleBlockType, string> = {
  procedure: 'Procedure',
  checklist: 'Checklist',
  media: 'Media',
}

function createBlock(type: FlexibleBlockType): FlexibleBlock {
  const id = crypto.randomUUID()
  if (type === 'procedure') return { id, type, steps: [''] }
  if (type === 'checklist') return { id, type, items: [{ id: crypto.randomUUID(), text: '', checked: false }] }
  return { id, type: 'media', content: '', alt: '', caption: '' }
}

type StyleTarget = 'title' | 'standard' | 'procedure' | 'checklist'

interface SectionStyle {
  fontSize: number
  textColor: string
}

const DEFAULT_STYLES: Record<StyleTarget, SectionStyle> = {
  title: { fontSize: 24, textColor: '#10201b' },
  standard: { fontSize: 14, textColor: '#10201b' },
  procedure: { fontSize: 14, textColor: '#10201b' },
  checklist: { fontSize: 14, textColor: '#10201b' },
}

export function SopBlockEditor() {
  const router = useRouter()
  const { showToast } = useToast()

  const [title, setTitle] = useState('')
  const [standard, setStandard] = useState('')
  const [blocks, setBlocks] = useState<FlexibleBlock[]>([createBlock('procedure')])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/v1/admin/sops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, standard, blocks }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not create the SOP')
      }
      setTitle('')
      setStandard('')
      setBlocks([createBlock('procedure')])
      router.refresh()
      showToast('SOP created.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the SOP')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderBlockFields = (block: FlexibleBlock) => {
    switch (block.type) {
      case 'procedure':
        return (
          <div className="space-y-2">
            {block.steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="data w-5 shrink-0 text-stone">{String(i + 1).padStart(2, '0')}</span>
                <Input
                  dense
                  value={step}
                  onChange={(e) => {
                    const steps = [...block.steps]
                    steps[i] = e.target.value
                    updateBlock(block.id, { steps } as Partial<ProcedureBlock>)
                  }}
                />
                <button
                  type="button"
                  onClick={() => updateBlock(block.id, { steps: block.steps.filter((_, si) => si !== i) } as Partial<ProcedureBlock>)}
                  className="text-stone transition-colors hover:text-claret"
                  aria-label="Remove step"
                >
                  &times;
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="subtle"
              tone="brass"
              onClick={() => updateBlock(block.id, { steps: [...block.steps, ''] } as Partial<ProcedureBlock>)}
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
                updateBlock(block.id, { items: [...block.items, { id: crypto.randomUUID(), text: '', checked: false }] } as Partial<ChecklistBlock>)
              }
            >
              + Add item
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

  const renderBlockPreview = (block: FlexibleBlock) => {
    switch (block.type) {
      case 'procedure': {
        const steps = block.steps.filter((s) => s.trim())
        if (steps.length === 0) return null
        return (
          <div key={block.id} className="mb-8">
            <p className="eyebrow mb-3">Procedure</p>
            <ol className="space-y-3" style={{ fontSize: styles.procedure.fontSize, color: styles.procedure.textColor }}>
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="data shrink-0 text-brass">{String(i + 1).padStart(2, '0')}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )
      }
      case 'checklist': {
        const items = block.items.filter((it) => it.text.trim())
        if (items.length === 0) return null
        return (
          <div key={block.id} className="mb-8">
            <p className="eyebrow mb-3">Checklist</p>
            <ul className="space-y-2" style={{ fontSize: styles.checklist.fontSize, color: styles.checklist.textColor }}>
              {items.map((item) => (
                <li key={item.id} className={item.checked ? 'text-stone line-through' : ''}>
                  {item.checked ? '☑' : '☐'} {item.text}
                </li>
              ))}
            </ul>
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

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-5">
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
              </select>
            </div>
            <div>
              <label className="eyebrow mb-1.5 block">Font size ({currentStyle.fontSize}px)</label>
              <input
                type="range"
                min={12}
                max={36}
                value={currentStyle.fontSize}
                onChange={(e) => updateCurrentStyle({ fontSize: parseInt(e.target.value, 10) })}
                className="w-full accent-brass"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="eyebrow">Text colour</label>
              <input
                type="color"
                value={currentStyle.textColor}
                onChange={(e) => updateCurrentStyle({ textColor: e.target.value })}
                className="h-7 w-10 cursor-pointer border hairline"
              />
            </div>
          </div>
        </div>

        <div>
          <p className="eyebrow mb-2">Add block</p>
          <div className="flex gap-4">
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

      <div className="border hairline bg-paper-raised p-8">
        <p className="eyebrow mb-2">Preview</p>
        <h2
          className="display mb-6 border-b hairline pb-4 text-ink"
          style={{ fontSize: styles.title.fontSize, color: styles.title.textColor }}
        >
          {title || 'Untitled standard'}
        </h2>
        <div className="mb-8">
          <p className="eyebrow mb-2">Standard</p>
          <p
            className="font-display italic text-ink-soft"
            style={{ fontSize: styles.standard.fontSize, color: styles.standard.textColor }}
          >
            {standard || 'No standard set.'}
          </p>
        </div>
        {blocks.map(renderBlockPreview)}
      </div>
    </div>
  )
}
