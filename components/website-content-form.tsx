'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'

interface WebsiteContentFormProps {
  initialHeroEyebrow: string
  initialHeroTitle: string
  initialHeroSubtitle: string
  initialFooterText: string
}

export function WebsiteContentForm({
  initialHeroEyebrow,
  initialHeroTitle,
  initialHeroSubtitle,
  initialFooterText,
}: WebsiteContentFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [heroEyebrow, setHeroEyebrow] = useState(initialHeroEyebrow)
  const [heroTitle, setHeroTitle] = useState(initialHeroTitle)
  const [heroSubtitle, setHeroSubtitle] = useState(initialHeroSubtitle)
  const [footerText, setFooterText] = useState(initialFooterText)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSaving(true)
    try {
      const response = await fetch('/api/v1/admin/website-content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroEyebrow,
          heroTitle,
          heroSubtitle,
          footerText,
        }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not save website content')
      }
      router.refresh()
      showToast('Website content saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save website content')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="max-w-lg space-y-5">
      <div>
        <label htmlFor="heroEyebrow" className="eyebrow mb-1.5 block">
          Hero eyebrow
        </label>
        <Input id="heroEyebrow" value={heroEyebrow} onChange={(e) => setHeroEyebrow(e.target.value)} />
      </div>

      <div>
        <label htmlFor="heroTitle" className="eyebrow mb-1.5 block">
          Hero title
        </label>
        <Input id="heroTitle" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
      </div>

      <div>
        <label htmlFor="heroSubtitle" className="eyebrow mb-1.5 block">
          Hero subtitle
        </label>
        <Textarea
          id="heroSubtitle"
          rows={3}
          value={heroSubtitle}
          onChange={(e) => setHeroSubtitle(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="footerText" className="eyebrow mb-1.5 block">
          Footer text
        </label>
        <Input id="footerText" value={footerText} onChange={(e) => setFooterText(e.target.value)} />
      </div>

      {error && (
        <p role="alert" className="text-sm text-claret">
          {error}
        </p>
      )}

      <Button type="submit" isLoading={isSaving} loadingLabel="Saving…">
        Save website content
      </Button>
    </form>
  )
}
