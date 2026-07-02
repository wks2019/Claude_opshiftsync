'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface IssueCertificateFormProps {
  courseId: string
}

interface IssuedCertificate {
  certificateNumber: string
  qrToken: string
}

export function IssueCertificateForm({ courseId }: IssueCertificateFormProps) {
  const [email, setEmail] = useState('')
  const [expiresInMonths, setExpiresInMonths] = useState('')
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
        body: JSON.stringify({
          userId: lookupPayload.data.id,
          courseId,
          ...(expiresInMonths ? { expiresInMonths: Number(expiresInMonths) } : {}),
        }),
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
      setExpiresInMonths('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not issue the certificate')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (issued) {
    return (
      <Card>
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
        <Button variant="subtle" tone="stone" className="mt-3 ml-6" onClick={() => setIssued(null)}>
          Issue another
        </Button>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="certRecipientEmail" className="eyebrow mb-1.5 block">
          Recipient email
        </label>
        <Input
          id="certRecipientEmail"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="certExpiry" className="eyebrow mb-1.5 block">
          Expiry
        </label>
        <Select
          id="certExpiry"
          value={expiresInMonths}
          onChange={(event) => setExpiresInMonths(event.target.value)}
        >
          <option value="">Never expires</option>
          <option value="12">1 year</option>
          <option value="24">2 years</option>
          <option value="36">3 years</option>
        </Select>
      </div>

      {error && (
        <p role="alert" className="text-sm text-claret">
          {error}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting} loadingLabel="Issuing…">
        Issue certificate
      </Button>
    </form>
  )
}
