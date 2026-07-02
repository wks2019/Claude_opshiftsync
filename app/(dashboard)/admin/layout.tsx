import { redirect } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { DashboardShell } from '@/components/dashboard-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardShell role="administrator" propertyName="Chosen Workflow" currentPath="/admin">
      {children}
    </DashboardShell>
  )
}
