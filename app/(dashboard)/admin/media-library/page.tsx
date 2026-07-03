import { createClient } from '@/services/supabase/server'
import { MediaLibrary } from '@/components/media-library'

export default async function AdminMediaLibraryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('users').select('hotel_group_id').eq('id', user.id).single()
    : { data: null }

  const { data: assets } = await supabase
    .from('media_assets')
    .select('id, storage_path, file_name, mime_type, size_bytes, folder, tags, created_at')
    .order('created_at', { ascending: false })

  return (
    <section className="fade-in">
      <p className="eyebrow mb-2">Media</p>
      <h1 className="display mb-10 text-2xl text-ink">Media library</h1>
      <MediaLibrary assets={assets ?? []} hotelGroupId={profile?.hotel_group_id ?? ''} />
    </section>
  )
}
