'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface BrandingFormProps {
  initialLogoUrl: string
  initialAccentColor: string
}

export function BrandingForm({ initialLogoUrl, initialAccentColor }: BrandingFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl)
  const [accentColor, setAccentColor] = useState(initialAccentColor)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSaving(true)
    try {
      const response = await fetch('/api/v1/admin/property', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branding: {
            ...(logoUrl ? { logoUrl } : {}),
            accentColor,
          },
        }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not save branding')
      }
      router.refresh()
      showToast('Branding saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save branding')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="max-w-sm space-y-5">
      <div>
        <label htmlFor="logoUrl" className="eyebrow mb-1.5 block">
          Logo URL
        </label>
        <Input
          id="logoUrl"
          type="url"
          placeholder="https://…"
          value={logoUrl}
          onChange={(event) => setLogoUrl(event.target.value)}
        />
        <p className="mt-1 text-sm text-stone">Leave blank to use the platform default.</p>
      </div>

      <div>
        <label htmlFor="accentColor" className="eyebrow mb-1.5 block">
          Accent colour
        </label>
        <div className="flex items-center gap-3">
          <input
            id="accentColor"
            type="color"
            value={accentColor}
            onChange={(event) => setAccentColor(event.target.value)}
            className="h-9 w-14 border hairline bg-transparent"
          />
          <Input
            value={accentColor}
            onChange={(event) => setAccentColor(event.target.value)}
            fullWidth={false}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-claret">
          {error}
        </p>
      )}

      <Button type="submit" isLoading={isSaving} loadingLabel="Saving…">
        Save branding
      </Button>
    </form>
  )
}
