import { createAdminClient } from '@/services/supabase/admin'

interface PageProps {
  params: Promise<{ qrToken: string }>
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { qrToken } = await params
  const admin = createAdminClient()

  const { data } = await admin
    .from('certificates')
    .select('certificate_number, issued_at, revoked_at, expires_at, users(full_name), courses(title)')
    .eq('qr_token', qrToken)
    .single()

  if (!data) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="eyebrow mb-3 text-claret">Not found</p>
        <h1 className="display text-xl text-ink">This certificate could not be verified.</h1>
      </main>
    )
  }

  const holderName = (data.users as { full_name: string } | null)?.full_name ?? 'Unknown'
  const courseTitle = (data.courses as { title: string } | null)?.title
  const isRevoked = data.revoked_at !== null
  const isExpired = data.expires_at !== null && new Date(data.expires_at) < new Date()
  const isValid = !isRevoked && !isExpired

  const statusLabel = isRevoked ? 'Revoked' : isExpired ? 'Expired' : 'Verified'

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <p className={`eyebrow mb-3 ${isValid ? 'text-sage' : 'text-claret'}`}>{statusLabel}</p>
      <h1 className="display mb-6 text-2xl text-ink">{holderName}</h1>
      {courseTitle && <p className="mb-1 text-ink-soft">{courseTitle}</p>}
      <p className="data mb-8 text-sm text-stone">{data.certificate_number}</p>
      <p className="eyebrow text-stone">
        Issued {new Date(data.issued_at).toLocaleDateString('en-GB', { dateStyle: 'long' })}
      </p>
      {data.expires_at && (
        <p className="eyebrow mt-1 text-stone">
          {isExpired ? 'Expired' : 'Valid until'}{' '}
          {new Date(data.expires_at).toLocaleDateString('en-GB', { dateStyle: 'long' })}
        </p>
      )}
    </main>
  )
}
