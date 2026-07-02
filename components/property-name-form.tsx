'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'

export function PropertyNameForm({ initialName }: { initialName: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [name, setName] = useState(initialName)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function save() {
    if (name === initialName) return
    setError(null)
    setIsSaving(true)
    try {
      const response = await fetch('/api/v1/admin/property', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not save')
      }
      router.refresh()
      showToast('Property name saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-sm">
      <label htmlFor="propertyName" className="eyebrow mb-1.5 block">
        Property name
      </label>
      <input
        id="propertyName"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={save}
        className="w-full border-b hairline bg-transparent py-2 text-ink outline-none transition-colors focus:border-brass"
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-claret">
          {error}
        </p>
      )}
      {isSaving && <p className="eyebrow mt-2 text-stone">Saving…</p>}
    </div>
  )
}
