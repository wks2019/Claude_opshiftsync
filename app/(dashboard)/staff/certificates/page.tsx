import { createClient } from '@/services/supabase/server'

export default async function StaffCertificatesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: certificates } = user
    ? await supabase
        .from('certificates')
        .select('id, certificate_number, qr_token, issued_at, revoked_at, expires_at, courses(title)')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false })
    : { data: null }

  return (
    <section className="fade-in">
      <p className="eyebrow mb-2">Certificates</p>
      <h1 className="display mb-8 text-2xl text-ink">Your certificates</h1>

      {!certificates || certificates.length === 0 ? (
        <p className="text-stone">Nothing issued yet. Certificates appear here once earned.</p>
      ) : (
        <ol>
          {certificates.map((cert) => {
            const isExpired = cert.expires_at !== null && new Date(cert.expires_at) < new Date()
            return (
              <li key={cert.id} className="border-t hairline py-4">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <p className="text-ink-soft">
                      {(cert.courses as { title: string } | null)?.title ?? 'Certificate'}
                    </p>
                    <p className="data text-sm text-stone">{cert.certificate_number}</p>
                    {isExpired && <p className="eyebrow mt-1 text-claret">Expired</p>}
                  </div>
                  <a
                    href={`/certificates/verify/${cert.qr_token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="eyebrow shrink-0 border-b border-brass pb-0.5 transition-colors hover:text-brass"
                  >
                    Verify
                  </a>
                </div>
              </li>
            )
          })}
          <li className="border-t hairline" aria-hidden="true" />
        </ol>
      )}
    </section>
  )
}
