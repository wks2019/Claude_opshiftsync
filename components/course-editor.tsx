'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CourseEditorProps {
  courseId: string
  initialTitle: string
  initialDescription: string
  initialStatus: 'draft' | 'published' | 'archived'
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}

export function CourseEditor({
  courseId,
  initialTitle,
  initialDescription,
  initialStatus,
}: CourseEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [status, setStatus] = useState(initialStatus)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function save(patch: Partial<{ title: string; description: string; status: string }>) {
    setError(null)
    setIsSaving(true)
    try {
      const response = await fetch(`/api/v1/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Save failed')
      }
      if (patch.status) setStatus(patch.status as typeof status)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <span className="eyebrow">{STATUS_LABEL[status]}</span>
        <div className="flex gap-3">
          {status !== 'published' && (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => save({ status: 'published' })}
              className="eyebrow border-b border-sage pb-0.5 text-sage transition-opacity hover:opacity-70 disabled:opacity-40"
            >
              Publish
            </button>
          )}
          {status !== 'archived' && (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => save({ status: 'archived' })}
              className="eyebrow border-b border-claret pb-0.5 text-claret transition-opacity hover:opacity-70 disabled:opacity-40"
            >
              Archive
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="editTitle" className="eyebrow mb-1.5 block">
            Title
          </label>
          <input
            id="editTitle"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => title !== initialTitle && save({ title })}
            className="w-full border-b hairline bg-transparent py-2 text-ink outline-none transition-colors focus:border-brass"
          />
        </div>

        <div>
          <label htmlFor="editDescription" className="eyebrow mb-1.5 block">
            Description
          </label>
          <textarea
            id="editDescription"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            onBlur={() => description !== initialDescription && save({ description })}
            className="w-full border hairline bg-transparent p-2 text-ink outline-none transition-colors focus:border-brass"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-claret">
            {error}
          </p>
        )}
        {isSaving && <p className="eyebrow text-stone">Saving…</p>}
      </div>
    </div>
  )
}
