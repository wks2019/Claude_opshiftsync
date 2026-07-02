'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface InviteResult {
  email: string
  tempPassword: string
}

export function InviteUserForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'staff' | 'manager' | 'administrator'>('staff')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<InviteResult | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/v1/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, role }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) {
        throw new Error(payload.error?.message ?? 'Could not create the account')
      }
      setResult({ email, tempPassword: payload.data.tempPassword })
      setFullName('')
      setEmail('')
      setRole('staff')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the account')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="border hairline p-5">
        <p className="eyebrow mb-2 text-sage">Account created</p>
        <p className="text-ink-soft">
          Share these credentials with <span className="text-ink">{result.email}</span> directly.
          They will not be shown again.
        </p>
        <dl className="data mt-4 space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-stone">Email</dt>
            <dd className="text-ink">{result.email}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-stone">Password</dt>
            <dd className="text-ink">{result.tempPassword}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => setResult(null)}
          className="eyebrow mt-5 border-b border-brass pb-0.5 text-ink transition-colors hover:text-brass"
        >
          Invite another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="fullName" className="eyebrow mb-1.5 block">
          Full name
        </label>
        <input
          id="fullName"
          required
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="w-full border-b hairline bg-transparent py-2 text-ink outline-none transition-colors focus:border-brass"
        />
      </div>

      <div>
        <label htmlFor="email" className="eyebrow mb-1.5 block">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full border-b hairline bg-transparent py-2 text-ink outline-none transition-colors focus:border-brass"
        />
      </div>

      <div>
        <label htmlFor="role" className="eyebrow mb-1.5 block">
          Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(event) => setRole(event.target.value as typeof role)}
          className="w-full border-b hairline bg-transparent py-2 text-ink outline-none transition-colors focus:border-brass"
        >
          <option value="staff">Staff</option>
          <option value="manager">Manager</option>
          <option value="administrator">Administrator</option>
        </select>
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
        {isSubmitting ? 'Creating…' : 'Create account'}
      </button>
    </form>
  )
}
