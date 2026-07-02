'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'

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
  const { showToast } = useToast()
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
      if (patch.status) {
        setStatus(patch.status as typeof status)
        showToast(`Course ${(STATUS_LABEL[patch.status] ?? patch.status).toLowerCase()}.`)
      }
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
            <Button
              variant="subtle"
              tone="sage"
              disabled={isSaving}
              onClick={() => save({ status: 'published' })}
            >
              Publish
            </Button>
          )}
          {status !== 'archived' && (
            <Button
              variant="subtle"
              tone="claret"
              disabled={isSaving}
              onClick={() => save({ status: 'archived' })}
            >
              Archive
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="editTitle" className="eyebrow mb-1.5 block">
            Title
          </label>
          <Input
            id="editTitle"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => title !== initialTitle && save({ title })}
          />
        </div>

        <div>
          <label htmlFor="editDescription" className="eyebrow mb-1.5 block">
            Description
          </label>
          <Textarea
            id="editDescription"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            onBlur={() => description !== initialDescription && save({ description })}
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
