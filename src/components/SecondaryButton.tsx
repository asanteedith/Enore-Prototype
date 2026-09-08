import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean
}

export function SecondaryButton({ fullWidth = true, className = '', ...rest }: Props) {
  return (
    <button
      className={`btn btn-secondary ${fullWidth ? 'btn-full' : ''} ${className}`.trim()}
      {...rest}
    />
  )
}
