'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

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
      <Card>
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
        <Button variant="subtle" tone="brass" className="mt-5" onClick={() => setResult(null)}>
          Invite another
        </Button>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="fullName" className="eyebrow mb-1.5 block">
          Full name
        </label>
        <Input
          id="fullName"
          required
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="email" className="eyebrow mb-1.5 block">
          Email
        </label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="role" className="eyebrow mb-1.5 block">
          Role
        </label>
        <Select id="role" value={role} onChange={(event) => setRole(event.target.value as typeof role)}>
          <option value="staff">Staff</option>
          <option value="manager">Manager</option>
          <option value="administrator">Administrator</option>
        </Select>
      </div>

      {error && (
        <p role="alert" className="text-sm text-claret">
          {error}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting} loadingLabel="Creating…">
        Create account
      </Button>
    </form>
  )
}
