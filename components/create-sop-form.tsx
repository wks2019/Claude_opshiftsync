'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { FieldHint } from '@/components/ui/field-hint'

export function CreateSopForm() {
  const router = useRouter()
  const { showToast } = useToast()
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
      showToast('SOP created.')
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
          <FieldHint example="In-Room Dining: Breakfast Delivery" />
        </label>
        <Input
          id="sopTitle"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="sopSteps" className="eyebrow mb-1.5 block">
          Steps (one per line)
          <FieldHint example={'Knock and announce before entering\nGreet the guest by name\nConfirm the order matches the ticket\nSet the tray before opening curtains or adjusting lighting'} />
        </label>
        <Textarea
          id="sopSteps"
          rows={6}
          value={stepsText}
          onChange={(event) => setStepsText(event.target.value)}
          placeholder={'Knock and announce before entering\nGreet the guest by name\n…'}
        />
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
  )
}
