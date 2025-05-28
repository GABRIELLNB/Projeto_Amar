import { type ComponentProps, ReactNode } from 'react'

interface IconButtonProps extends ComponentProps<'button'> {}

export function IconButton(props: IconButtonProps) {
  return (
    <button
      className=" p-1.5 bg-pink1000 text-blue1000 rounded-md cursor-pointer transition-colors duration-300  hover:text-pink4000"
      {...props}
    />
  )
}
