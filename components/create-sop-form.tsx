'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export function CreateSopForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [stepsText, setStepsText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      const response = await fetch('/api/v1/admin/sops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, steps }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not create the SOP')
      }
      setTitle('')
      setStepsText('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the SOP')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="sopTitle" className="eyebrow mb-1.5 block">
          Title
        </label>
        <input
          id="sopTitle"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full border-b hairline bg-transparent py-2 text-ink outline-none transition-colors focus:border-brass"
        />
      </div>

      <div>
        <label htmlFor="sopSteps" className="eyebrow mb-1.5 block">
          Steps (one per line)
        </label>
        <textarea
          id="sopSteps"
          rows={6}
          value={stepsText}
          onChange={(event) => setStepsText(event.target.value)}
          placeholder={'Knock and announce before entering\nGreet the guest by name\n…'}
          className="w-full border hairline bg-transparent p-2 text-ink outline-none transition-colors focus:border-brass"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-claret">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="border border-ink px-5 py-2 text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-40"
      >
        {isSubmitting ? 'Creating…' : 'Create SOP'}
      </button>
    </form>
  )
}
