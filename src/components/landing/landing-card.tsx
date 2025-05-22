import { JSX } from 'preact/jsx-runtime'
import { FaLock, FaPlus } from 'react-icons/fa6'
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }
type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U

const BaseLandingCard = ({ class: classname, children, link, ...props }: JSX.HTMLAttributes<HTMLButtonElement> & { link?: number }) => {
  return (
    <button
      class={`h-40 w-full flex-col rounded-md border bg-gray-50 text-center font-nunito text-lg font-bold centeric sm:w-52 sm:min-w-52 ${classname}`}
      // @ts-ignore
      sc_addr={link}
      {...props}
    >
      {children}
    </button>
  )
}

export const LandingCard = (
  props: XOR<{ lock?: true; children: string }, { new: true }> & { click?: JSX.MouseEventHandler<HTMLButtonElement>; link?: number }
) => {
  if (props.new)
    return (
      <BaseLandingCard
        class='cursor-pointer text-xl text-primary hover:border-primary hover:bg-gray-100'
        onClick={props.click}
        link={props.link}
      >
        <FaPlus />
      </BaseLandingCard>
    )

  if (props.lock)
    return (
      <BaseLandingCard class='text-gray-400' disabled>
        <FaLock />
        {props.children}
      </BaseLandingCard>
    )

  return (
    <BaseLandingCard class='cursor-pointer text-primary hover:border-primary hover:bg-gray-100' onClick={props.click} link={props.link}>
      {props.children}
    </BaseLandingCard>
  )
}
