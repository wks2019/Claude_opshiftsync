import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md'
}

const PADDING = {
  sm: 'p-4',
  md: 'p-5',
}

export function Card({ padding = 'md', className, children, ...props }: CardProps) {
  return (
    <div className={`border hairline ${PADDING[padding]} ${className ?? ''}`} {...props}>
      {children}
    </div>
  )
}
