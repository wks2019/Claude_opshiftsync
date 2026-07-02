interface SkeletonProps {
  className?: string
}

/** Single skeleton block. Compose these to match the shape of the real content. */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}

/** Skeleton for the standard "eyebrow + display heading" page header. */
export function SkeletonHeader() {
  return (
    <div>
      <Skeleton className="mb-2 h-3 w-20" />
      <Skeleton className="h-8 w-64" />
    </div>
  )
}

/** Skeleton for a hairline-bordered list, matching cards used across staff/manager/admin. */
export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="mt-10 border-t hairline pt-6">
      <Skeleton className="mb-3 h-3 w-24" />
      <ol className="space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <li key={index} className="border hairline p-5">
            <Skeleton className="mb-2 h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </li>
        ))}
      </ol>
    </div>
  )
}
