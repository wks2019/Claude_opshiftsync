import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'subtle'
type ButtonTone = 'ink' | 'sage' | 'claret' | 'brass' | 'stone'
type ButtonSize = 'md' | 'lg' | 'full'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  tone?: ButtonTone
  size?: ButtonSize
  isLoading?: boolean
  loadingLabel?: string
  children: ReactNode
}

const PRIMARY_BASE =
  'border border-ink text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-40'

const SUBTLE_TONE: Record<ButtonTone, string> = {
  ink: 'border-brass text-ink transition-colors hover:text-brass',
  sage: 'border-sage text-sage transition-opacity hover:opacity-70',
  claret: 'border-claret text-claret transition-opacity hover:opacity-70',
  brass: 'border-brass text-ink transition-colors hover:text-brass',
  stone: 'border-transparent text-stone transition-colors hover:text-ink',
}

const SIZE: Record<ButtonSize, string> = {
  md: 'px-5 py-2',
  lg: 'px-6 py-2.5',
  full: 'w-full py-2.5',
}

/** Every button in the product is one of these two shapes: a solid ink box
 *  for the primary action, or an eyebrow underline for secondary actions. */
export function Button({
  variant = 'primary',
  tone = 'ink',
  size = 'md',
  isLoading = false,
  loadingLabel,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const label = isLoading ? (loadingLabel ?? children) : children

  if (variant === 'subtle') {
    return (
      <button
        type={type}
        disabled={disabled || isLoading}
        className={`eyebrow border-b pb-0.5 disabled:opacity-40 ${SUBTLE_TONE[tone]} ${className ?? ''}`}
        {...props}
      >
        {label}
      </button>
    )
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${PRIMARY_BASE} ${SIZE[size]} ${className ?? ''}`}
      {...props}
    >
      {label}
    </button>
  )
}
