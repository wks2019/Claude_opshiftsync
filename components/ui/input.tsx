import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FieldSizing {
  /** Defaults to true, matching every existing field except the inline guest-mood input. */
  fullWidth?: boolean
  /** Tighter vertical padding, used only by the simulation scoring grid. */
  dense?: boolean
}

function fieldClassName({ fullWidth = true, dense = false }: FieldSizing, extra?: string) {
  return [
    fullWidth ? 'w-full' : '',
    'border-b hairline bg-transparent text-ink outline-none transition-colors focus:border-brass',
    dense ? 'py-1' : 'py-2',
    extra ?? '',
  ]
    .filter(Boolean)
    .join(' ')
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & FieldSizing

export function Input({ className, fullWidth, dense, ...props }: InputProps) {
  return <input className={fieldClassName({ fullWidth, dense }, className)} {...props} />
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full border hairline bg-transparent p-2 text-ink outline-none transition-colors focus:border-brass ${className ?? ''}`}
      {...props}
    />
  )
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & FieldSizing

export function Select({ className, fullWidth, dense, ...props }: SelectProps) {
  return <select className={fieldClassName({ fullWidth, dense }, className)} {...props} />
}
