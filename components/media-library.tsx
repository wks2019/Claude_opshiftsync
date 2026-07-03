'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/services/supabase/client'
import { useToast } from '@/components/toast-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface MediaAsset {
  id: string
  storage_path: string
  file_name: string
  mime_type: string
  size_bytes: number
  folder: string
  tags: string[]
  created_at: string
}

interface MediaLibraryProps {
  assets: MediaAsset[]
  hotelGroupId: string
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

function publicUrl(storagePath: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/media/${storagePath}`
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaLibrary({ assets, hotelGroupId }: MediaLibraryProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [folder, setFolder] = useState('general')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterFolder, setFilterFolder] = useState('all')

  const folders = Array.from(new Set(assets.map((a) => a.folder))).sort()
  const visibleAssets = filterFolder === 'all' ? assets : assets.filter((a) => a.folder === filterFolder)

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !hotelGroupId) return

    setError(null)
    setIsUploading(true)
    try {
      const supabase = createClient()
      const path = `${hotelGroupId}/${crypto.randomUUID()}-${file.name}`

      const { error: uploadError } = await supabase.storage.from('media').upload(path, file, {
        contentType: file.type,
      })
      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const response = await fetch('/api/v1/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storagePath: path,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          sizeBytes: file.size,
          folder,
        }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not record the upload')
      }

      router.refresh()
      showToast('Uploaded.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/v1/admin/media/${id}`, { method: 'DELETE' })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not delete')
      }
      router.refresh()
      showToast('Deleted.')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not delete', 'error')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="uploadFolder" className="eyebrow mb-1.5 block">
            Folder
          </label>
          <Input
            id="uploadFolder"
            value={folder}
            onChange={(event) => setFolder(event.target.value || 'general')}
            fullWidth={false}
          />
        </div>
        <label className="border border-ink px-5 py-2 text-ink transition hover:bg-ink hover:text-paper motion-safe:active:scale-[0.98]">
          {isUploading ? 'Uploading…' : 'Upload file'}
          <input type="file" onChange={handleUpload} disabled={isUploading} className="hidden" />
        </label>
        {folders.length > 0 && (
          <div>
            <label htmlFor="filterFolder" className="eyebrow mb-1.5 block">
              Filter
            </label>
            <select
              id="filterFolder"
              value={filterFolder}
              onChange={(event) => setFilterFolder(event.target.value)}
              className="border-b hairline bg-transparent py-2 text-ink outline-none focus:border-brass"
            >
              <option value="all">All folders</option>
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-claret">
          {error}
        </p>
      )}

      {visibleAssets.length === 0 ? (
        <p className="text-stone">No files yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {visibleAssets.map((asset) => (
            <Card key={asset.id} padding="sm" className="fade-in">
              {asset.mime_type.startsWith('image/') ? (
                <div className="relative mb-2 h-24 w-full">
                  <Image
                    src={publicUrl(asset.storage_path)}
                    alt={asset.file_name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="mb-2 flex h-24 w-full items-center justify-center border hairline">
                  <span className="eyebrow text-stone">{asset.mime_type.split('/')[1] ?? 'file'}</span>
                </div>
              )}
              <p className="truncate text-sm text-ink-soft">{asset.file_name}</p>
              <p className="eyebrow mt-1 text-stone">{formatSize(asset.size_bytes)}</p>
              <Button
                variant="subtle"
                tone="claret"
                className="mt-2"
                onClick={() => handleDelete(asset.id)}
              >
                Delete
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
