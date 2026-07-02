'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="border hairline p-8">
      <p className="eyebrow mb-2 text-claret">Something went wrong</p>
      <h1 className="display mb-4 text-xl text-ink">This screen could not load</h1>
      <p className="mb-6 text-sm text-stone">
        The team has been notified. You can try again, or return to the previous screen.
      </p>
      <button
        type="button"
        onClick={reset}
        className="border border-ink px-5 py-2 text-ink transition-colors hover:bg-ink hover:text-paper"
      >
        Try again
      </button>
    </section>
  )
}
