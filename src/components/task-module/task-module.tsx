import { FaAngleLeft } from 'react-icons/fa6'
import { navigation } from '../../store/slices/navigation'
import { Link } from '../common/link'
import { GraphComponent } from '../graph-editor/graph-editor'

export const TaskModule = () => {
  const { gotoLanding } = navigation
  return (
    <div class='grid h-full grid-rows-[10%,5%,60%,1fr] items-baseline'>
      <button onClick={gotoLanding} class='cursor-pointer rounded-full bg-transparent p-3 text-xl hover:text-primary'>
        <FaAngleLeft />
      </button>

      <h2 class='justify-self-center text-2xl font-medium'>
        Задача определения <Link>ориентированности графа</Link>
      </h2>
      <div class='centeric'>
        <GraphComponent class='w-fit rounded border border-primary' w={500} h={400} />
      </div>
      <div />
    </div>
  )
}
