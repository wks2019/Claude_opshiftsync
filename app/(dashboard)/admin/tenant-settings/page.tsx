import { createClient } from '@/services/supabase/server'
import { PropertyNameForm } from '@/components/property-name-form'

export default async function AdminPropertyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('users').select('hotel_group_id').eq('id', user.id).single()
    : { data: null }

  const { data: hotelGroup } = profile
    ? await supabase.from('hotel_groups').select('id, name').eq('id', profile.hotel_group_id).single()
    : { data: null }

  return (
    <section className="fade-in">
      <p className="eyebrow mb-2">Property</p>
      <h1 className="display mb-10 text-2xl text-ink">Settings</h1>

      {hotelGroup ? (
        <PropertyNameForm initialName={hotelGroup.name} />
      ) : (
        <p className="text-stone">Could not load property settings.</p>
      )}

      <p className="mt-10 max-w-sm text-sm text-stone">
        Branding (logo, colour palette, typography) and hotels/departments/teams management are
        on the way.
      </p>
    </section>
  )
}
