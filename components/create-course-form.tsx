'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'

export function CreateCourseForm() {
  const router = useRouter()
  const { showToast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/v1/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: description || undefined }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not create the course')
      }
      setTitle('')
      setDescription('')
      router.refresh()
      showToast('Course created as a draft.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the course')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="courseTitle" className="eyebrow mb-1.5 block">
          Title
        </label>
        <input
          id="courseTitle"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full border-b hairline bg-transparent py-2 text-ink outline-none transition-colors focus:border-brass"
        />
      </div>

      <div>
        <label htmlFor="courseDescription" className="eyebrow mb-1.5 block">
          Description
        </label>
        <textarea
          id="courseDescription"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
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
        {isSubmitting ? 'Creating…' : 'Create draft'}
      </button>
    </form>
  )
}
