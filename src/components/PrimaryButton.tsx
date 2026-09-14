import type { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean
}

export function PrimaryButton({ fullWidth = true, className = '', ...rest }: Props) {
  return (
    <button
      className={`btn btn-primary ${fullWidth ? 'btn-full' : ''} ${className}`.trim()}
      {...rest}
    />
  )
}
