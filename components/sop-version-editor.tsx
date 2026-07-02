'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'

interface VersionSummary {
  id: string
  version_number: number
  published_at: string | null
}

interface SopVersionEditorProps {
  sopId: string
  currentSteps: string[]
  history: VersionSummary[]
}

export function SopVersionEditor({ sopId, currentSteps, history }: SopVersionEditorProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [stepsText, setStepsText] = useState(currentSteps.join('\n'))
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function publishNewVersion(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const steps = stepsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    if (steps.length === 0) {
      setError('Add at least one step, one per line.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/v1/admin/sops/${sopId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not publish new version')
      }
      router.refresh()
      showToast(`Version ${payload.data.version_number} published.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not publish new version')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow mb-4">Version history</p>
        <ol>
          {history.map((entry) => (
            <li key={entry.id} className="border-t hairline py-3">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-ink-soft">Version {entry.version_number}</span>
                <span className="eyebrow shrink-0 text-stone">
                  {entry.published_at ? new Date(entry.published_at).toLocaleDateString() : 'Draft'}
                </span>
              </div>
            </li>
          ))}
          {history.length === 0 && (
            <li className="border-t hairline py-3 text-stone">No versions yet.</li>
          )}
          <li className="border-t hairline" aria-hidden="true" />
        </ol>
      </div>

      <form onSubmit={publishNewVersion} className="space-y-4">
        <p className="eyebrow">Publish a new version</p>
        <Textarea
          rows={8}
          value={stepsText}
          onChange={(event) => setStepsText(event.target.value)}
          placeholder="One step per line"
        />
        {error && (
          <p role="alert" className="text-sm text-claret">
            {error}
          </p>
        )}
        <Button type="submit" isLoading={isSubmitting} loadingLabel="Publishing…">
          Publish new version
        </Button>
      </form>
    </div>
  )
}
