'use client'

import { useState, type FormEvent } from 'react'

interface IssueCertificateFormProps {
  courseId: string
}

interface IssuedCertificate {
  certificateNumber: string
  qrToken: string
}

export function IssueCertificateForm({ courseId }: IssueCertificateFormProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [issued, setIssued] = useState<IssuedCertificate | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    setIssued(null)

    try {
      const lookupResponse = await fetch(
        `/api/v1/admin/users/lookup?email=${encodeURIComponent(email)}`
      )
      const lookupPayload = await lookupResponse.json()
      if (!lookupResponse.ok || lookupPayload.error) {
        throw new Error(lookupPayload.error?.message ?? 'No user found with that email')
      }

      const issueResponse = await fetch('/api/v1/admin/certificates/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: lookupPayload.data.id, courseId }),
      })
      const issuePayload = await issueResponse.json()
      if (!issueResponse.ok || issuePayload.error) {
        throw new Error(issuePayload.error?.message ?? 'Could not issue the certificate')
      }

      setIssued({
        certificateNumber: issuePayload.data.certificate_number,
        qrToken: issuePayload.data.qr_token,
      })
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not issue the certificate')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (issued) {
    return (
      <div className="border hairline p-5">
        <p className="eyebrow mb-2 text-sage">Certificate issued</p>
        <p className="data text-ink">{issued.certificateNumber}</p>
        <a
          href={`/certificates/verify/${issued.qrToken}`}
          target="_blank"
          rel="noreferrer"
          className="eyebrow mt-3 inline-block border-b border-brass pb-0.5 text-ink transition-colors hover:text-brass"
        >
          View verification page
        </a>
        <button
          type="button"
          onClick={() => setIssued(null)}
          className="eyebrow mt-3 ml-6 border-b border-transparent pb-0.5 text-stone transition-colors hover:text-ink"
        >
          Issue another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="certRecipientEmail" className="eyebrow mb-1.5 block">
          Recipient email
        </label>
        <input
          id="certRecipientEmail"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full border-b hairline bg-transparent py-2 text-ink outline-none transition-colors focus:border-brass"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-claret">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="border border-ink px-5 py-2 text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-40"
      >
        {isSubmitting ? 'Issuing…' : 'Issue certificate'}
      </button>
    </form>
  )
}
