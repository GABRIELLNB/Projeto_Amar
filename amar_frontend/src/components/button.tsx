import {
  type ComponentProps,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  ReactPortal,
} from 'react'

interface ButtonProps extends ComponentProps<'button'> {}
export function Button(props: ButtonProps) {
  return (
    <button
      className="group flex justify-between items-center px-5 h-12 bg-blue1000 text-pink100 font-semibold rounded-xl w-full cursor-pointer transition-colors duration-300 hover:bg-pink3000 hover:text-pink4000"
      {...props}
    />
  )
}

interface ButtonIconProps extends ComponentProps<'span'> {}

export function ButtonIcon({ ...props }: ButtonIconProps) {
  return (
    <span
      className="text-pink200 group-focus-within:text-pink400 group-[&:not(:has(input:placeholder-shown))]:text-pink400 group-data[error=true]:text-red-700"
      {...props}
    />
  )
}

interface ButtonFieldProps extends ComponentProps<'span'> {}

export function ButtonField({ ...props }: ButtonFieldProps) {
  return (
    <span className="flex-1 text-pink4000" {...props} />
  );
}
