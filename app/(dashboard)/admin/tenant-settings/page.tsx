import { createClient } from '@/services/supabase/server'
import { PropertyNameForm } from '@/components/property-name-form'
import { HotelsManager } from '@/components/hotels-manager'
import { BrandingForm } from '@/components/branding-form'

export default async function AdminPropertyPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('users').select('hotel_group_id').eq('id', user.id).single()
    : { data: null }

  const { data: hotelGroup } = profile
    ? await supabase
        .from('hotel_groups')
        .select('id, name, branding')
        .eq('id', profile.hotel_group_id)
        .single()
    : { data: null }

  const { data: hotels } = profile
    ? await supabase
        .from('hotels')
        .select('id, name')
        .eq('hotel_group_id', profile.hotel_group_id)
        .order('name', { ascending: true })
    : { data: [] }

  const hotelIds = (hotels ?? []).map((h) => h.id)

  const { data: departments } =
    hotelIds.length > 0
      ? await supabase
          .from('departments')
          .select('id, hotel_id, name')
          .in('hotel_id', hotelIds)
          .order('name', { ascending: true })
      : { data: [] }

  const departmentIds = (departments ?? []).map((d) => d.id)

  const { data: teams } =
    departmentIds.length > 0
      ? await supabase
          .from('teams')
          .select('id, department_id, name')
          .in('department_id', departmentIds)
          .order('name', { ascending: true })
      : { data: [] }

  return (
    <section className="fade-in">
      <p className="eyebrow mb-2">Property</p>
      <h1 className="display mb-10 text-2xl text-ink">Settings</h1>

      {hotelGroup ? (
        <PropertyNameForm initialName={hotelGroup.name} />
      ) : (
        <p className="text-stone">Could not load property settings.</p>
      )}

      <div className="mt-16 border-t hairline pt-8">
        <p className="eyebrow mb-6">Branding</p>
        <BrandingForm
          initialLogoUrl={(hotelGroup?.branding as { logoUrl?: string } | undefined)?.logoUrl ?? ''}
          initialAccentColor={
            (hotelGroup?.branding as { accentColor?: string } | undefined)?.accentColor ?? '#a8894e'
          }
        />
      </div>

      <div className="mt-16 border-t hairline pt-8">
        <p className="eyebrow mb-6">Hotels, departments, and teams</p>
        <HotelsManager
          hotels={hotels ?? []}
          departments={departments ?? []}
          teams={teams ?? []}
        />
      </div>
    </section>
  )
}
