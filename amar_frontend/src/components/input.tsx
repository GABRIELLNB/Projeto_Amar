import type { ComponentProps } from 'react'

interface InputRootProps extends ComponentProps<'div'> {
  error?: boolean
}

export function InputRoot({ error = false, ...props }: InputRootProps) {
  return (
    <div
      data-error={error}
      className="group bg-pink1000 h-12 border border-pink2000 rounded-xl px-4 flex items-center gap-2 focus-within:border-pink4000 data-[error=true]:border-red-700"
      {...props}
    />
  )
}

interface InputIconProps extends ComponentProps<'span'> {}

export function InputIcon({ ...props }: InputIconProps) {
  return (
    <span
      className="text-pink2000 group-focus-within:text-pink4000 group-[&:not(:has(input:placeholder-shown))]:text-pink4000 group-data[error=true]:text-red-700"
      {...props}
    />
  )
}

interface InputFieldProps extends ComponentProps<'input'> {}

export function InputField({ ...props }: InputFieldProps) {
  return <input className="flex-1 outline-0 text-pink4000" {...props} />
}
