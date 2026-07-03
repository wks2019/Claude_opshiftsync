'use client'

import { useEffect, useState } from 'react'

interface FieldHintProps {
  example: string
}

const AUTO_DISMISS_MS = 5000

/** Small round "i" toggle next to a label. Click or tap reveals an example, auto-dismisses after 5s. */
export function FieldHint({ example }: FieldHintProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => setIsOpen(false), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [isOpen])

  return (
    <span className="relative ml-1.5 inline-block align-middle">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label="Show example"
        className="flex h-4 w-4 items-center justify-center rounded-full border border-stone font-serif text-[10px] italic leading-none text-stone transition-colors hover:border-brass hover:text-brass"
      >
        i
      </button>
      {isOpen && (
        <span
          role="tooltip"
          className="absolute left-0 top-6 z-20 w-64 border hairline bg-paper-raised p-3 text-sm normal-case text-ink-soft shadow-lg"
        >
          {example}
        </span>
      )}
    </span>
  )
}
