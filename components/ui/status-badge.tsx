type StatusTone = 'published' | 'draft'

const TONE: Record<StatusTone, string> = {
  published: 'border-sage text-sage',
  draft: 'border-brass-soft text-stone',
}

function toneFor(status: string): StatusTone {
  return status.toLowerCase() === 'published' ? 'published' : 'draft'
}

/** Small pill label for record status, used across CMS list rows. */
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`eyebrow shrink-0 rounded-full border px-2 py-0.5 text-[10px] ${TONE[toneFor(status)]}`}
    >
      {status}
    </span>
  )
}
