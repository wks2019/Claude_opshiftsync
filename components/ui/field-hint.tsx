'use client'

import { useState } from 'react'

interface FieldHintProps {
  example: string
}

/** Small "?" toggle next to a label. Click or tap reveals an example. */
export function FieldHint({ example }: FieldHintProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <span className="relative ml-1.5 inline-block align-middle">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label="Show example"
        className="flex h-4 w-4 items-center justify-center border border-stone text-[10px] leading-none text-stone transition-colors hover:border-brass hover:text-brass"
      >
        ?
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
