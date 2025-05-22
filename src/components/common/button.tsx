import { JSX } from 'preact/jsx-runtime'

type Props = JSX.HTMLAttributes<HTMLButtonElement> & {
  children: [JSX.Element, string] | JSX.Element | string | [JSX.Element, string, JSX.Element]
  class?: string
  link?: number
}
export const Button = ({ children, class: classlist, link, ...props }: Props) => {
  return (
    <button
      class={`w-full cursor-pointer select-none gap-2 rounded border bg-gray-50 p-1 font-semibold text-primary centeric hover:border-primary hover:bg-gray-100 ${classlist}`}
      // @ts-ignore
      sc_addr={link}
      {...props}
    >
      {children}
    </button>
  )
}
