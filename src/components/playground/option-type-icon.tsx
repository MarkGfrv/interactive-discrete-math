import { JSX } from 'preact/jsx-runtime'
import { BsThreeDots } from 'react-icons/bs'
import { FaCalculator, FaQuestion, FaTag } from 'react-icons/fa6'
import { MdOutlineGroupWork } from 'react-icons/md'
import { PiMathOperationsFill } from 'react-icons/pi'

export type PlaygroundOptionTypeIcons = 'tag' | 'math' | 'calculator' | 'set' | 'dots'
export const PlaygroundOptionTypeIcon = ({ icon }: { icon: PlaygroundOptionTypeIcons }) => {
  const components: Record<PlaygroundOptionTypeIcons, JSX.Element> = {
    tag: (
      <span class='pb-0.5 pt-2 text-xl'>
        <FaTag />
      </span>
    ),

    math: (
      <span class='pt-2 text-2xl'>
        <PiMathOperationsFill />
      </span>
    ),

    calculator: (
      <span class='pb-0.5 pt-2 text-xl'>
        <FaCalculator />
      </span>
    ),

    set: (
      <span class='pb-0.5 pt-2 text-2xl'>
        <MdOutlineGroupWork />
      </span>
    ),

    dots: (
      <span class='pb-0.5 pt-2 text-lg'>
        <BsThreeDots />
      </span>
    ),
  }
  return (
    components[icon] ?? (
      <span class='pb-0.5 pt-2 text-lg'>
        <FaQuestion />
      </span>
    )
  )
}
