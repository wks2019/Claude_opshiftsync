interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-baseline gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className="flex items-baseline gap-1.5">
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="text-stone transition-colors hover:text-ink"
                >
                  {item.label}
                </a>
              ) : (
                <span className={isLast ? 'text-ink-soft' : 'text-stone'}>{item.label}</span>
              )}
              {!isLast && <span className="text-stone" aria-hidden="true">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
