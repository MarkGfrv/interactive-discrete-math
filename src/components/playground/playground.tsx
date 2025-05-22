import { useSignal } from '@preact/signals'
import { useEffect, useRef } from 'preact/hooks'
import { FaAngleLeft, FaCheck, FaCode, FaListUl, FaPlus, FaXmark } from 'react-icons/fa6'
import { HiMiniSquares2X2 } from 'react-icons/hi2'
import { LuLoader, LuTrash2 } from 'react-icons/lu'
import { PiSelectionAllFill, PiSelectionBold } from 'react-icons/pi'
import { navigation } from '../../store/slices/navigation'
import { actionsMenuSlice, activeActionsSlice } from '../../store/slices/workspace'
import { executeAction } from '../../store/slices/workspace/agents'
import { Button } from '../common/button'
import { Link } from '../common/link'
import { GraphComponent } from '../graph-editor/graph-editor'
import { PlaygroundOptionTypeIcon } from './option-type-icon'
import { links } from '../../store/slices/links'

export const Playground = () => {
  const ref = useRef<HTMLDivElement>(null)
  const width = useSignal(0)
  const height = useSignal(0)

  const resize = () => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    if (!rect.width && !rect.height) return
    width.value = Math.round(rect.width) - 360
    height.value = Math.round(rect.height) * 0.95 - 2
  }

  useEffect(() => {
    const windowsListButton = document.querySelector('#windows-list')
    if (windowsListButton) windowsListButton.addEventListener('click', resize)
    window.addEventListener('resize', resize)
    resize()
    return () => {
      // workspace.reset()
      window.removeEventListener('resize', resize)
      if (windowsListButton) windowsListButton.removeEventListener('click', resize)
    }
  }, [])

  return (
    <div ref={ref} class='grid h-full grid-rows-[5%,1fr] items-baseline'>
      <div class='flex items-center justify-between'>
        <button onClick={() => navigation.gotoLanding()} class='cursor-pointer rounded-full bg-transparent p-3 text-xl hover:text-primary'>
          <FaAngleLeft />
        </button>
        <div class='flex gap-x-2'>
          <input
            class='cursor-default px-5 text-right text-lg focus:cursor-text'
            placeholder={'Новое пространство'}
            value={navigation.spaces.find(space => space.addr === navigation.current.value)?.name}
            onBlur={e => navigation.renameSpace(e.currentTarget.value)}
            onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
          />
          <button
            class='h-8 w-8 cursor-pointer rounded-sm text-lg text-gray-500 opacity-30 centeric hover:bg-gray-100 hover:text-gray-700 hover:opacity-100'
            onClick={() => navigation.deleteSpace()}
          >
            <LuTrash2 />
          </button>
        </div>
      </div>

      <div class='flex h-full gap-1'>
        <GraphComponent class='w-fit rounded border' w={width.value} h={height.value} />
        <div class='w-full rounded border p-3'>
          <div class='flex items-end justify-between pb-4'>
            <div class='pt-0.5 text-lg font-semibold'>Параметры</div>
            {/* <div class='flex rounded border text-lg'>
              <div class='cursor-pointer bg-gray-50 px-2.5 py-1.5 text-primary hover:bg-gray-100'>
                <FaListUl />
              </div>
              <div class='cursor-pointer px-2.5 py-1.5 hover:bg-gray-100'>
                <FaCode />
              </div>
            </div> */}
          </div>

          <ul class='flex flex-col gap-y-2'>
            {activeActionsSlice.activeActions.value.map(action => (
              <li key={action.addr} class='group cursor-default rounded border border-transparent p-0.5 shadow-[0_0.5px_0px_0.5px_#0000000d] hover:border-inherit'>
                <div class='grid grid-cols-[1fr,auto] items-center gap-x-2'>
                  <div class='flex w-full items-center gap-x-2 px-2.5 py-1'>
                    <span class='text-sm text-green-600'>
                      {
                        {
                          True: (
                            <span class='text-sm text-green-600'>
                              <FaCheck />
                            </span>
                          ),
                          False: (
                            <span class='text-sm text-red-600'>
                              <FaXmark />
                            </span>
                          ),
                          Details: (
                            <span class='text-xs text-blue-texture'>
                              <HiMiniSquares2X2 />
                            </span>
                          ),
                          Unknown: (
                            <div class='pb-[1px] text-sm text-gray-500 [&_path]:stroke-[3] [&_svg]:animate-spin'>
                              <LuLoader />
                            </div>
                          ),
                        }[action.status]
                      }
                    </span>
                    <span class='pt-[0.04rem]'>
                      <Link link={action.agent.agentArg.ref.addr}>
                        {action.agent.name}
                        {action.value === undefined ? '' : ': '}
                      </Link>
                    </span>
                    {action.value !== undefined && <span class='pt-[0.1rem] font-bold'>{action.value}</span>}
                  </div>
                  <div
                    class='h-8 w-8 cursor-pointer rounded-sm text-lg text-gray-400 opacity-30 centeric hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100'
                    onClick={() => activeActionsSlice.deleteActiveAction(action.addr)}
                  >
                    <LuTrash2 />
                  </div>
                </div>
                <div class='flex flex-wrap gap-x-2 gap-y-1 px-2.5 pb-2 pt-1'>
                  {action.args[0] && (
                    <div onClick={e => e.stopPropagation()} class='group/label grid cursor-pointer grid-cols-[auto,1fr] overflow-hidden rounded-md border border-transparent hover:border-primary hover:border-opacity-30'>
                      <span sc_addr={action.args[0]} class='bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500 centeric group-hover/label:bg-primary group-hover/label:bg-opacity-15 group-hover/label:text-primary'>
                        1
                      </span>
                      <span sc_addr={action.args[0]} class='bg-gray-50 px-2.5 py-0.5 text-sm font-semibold text-primary group-hover/label:bg-primary group-hover/label:bg-opacity-5'>
                        {action.args[0]}
                      </span>
                    </div>
                  )}
                  {action.args[1] && (
                    <div onClick={e => e.stopPropagation()} class='group/label grid cursor-pointer grid-cols-[auto,1fr] overflow-hidden rounded-md border border-transparent hover:border-primary hover:border-opacity-30'>
                      <span sc_addr={action.args[1]} class='bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500 centeric group-hover/label:bg-primary group-hover/label:bg-opacity-15 group-hover/label:text-primary'>
                        2
                      </span>
                      <span sc_addr={action.args[1]} class='bg-gray-50 px-2.5 py-0.5 text-sm font-semibold text-primary group-hover/label:bg-primary group-hover/label:bg-opacity-5'>
                        {action.args[1]}
                      </span>
                    </div>
                  )}
                  {action.status === 'Details' && (
                    <div class='group/label grid cursor-pointer grid-cols-[auto,1fr] overflow-hidden rounded-md border border-transparent hover:border-green-600 hover:border-opacity-30'>
                      <span class='bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500 centeric group-hover/label:bg-green-600 group-hover/label:bg-opacity-15 group-hover/label:text-green-600'>
                        Результат
                      </span>
                      <div onClick={e => e.stopPropagation()} sc_addr={action.result} class='flex items-center bg-gray-50 px-2.5 py-0.5 text-sm font-semibold text-green-600 group-hover/label:bg-green-600 group-hover/label:bg-opacity-5 group-hover/label:text-green-600'>
                        {action.result ? (
                          action.result
                        ) : (
                          <div class='[&_path]:stroke-[3] [&_svg]:animate-spin'>
                            <LuLoader />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <Button
            class='mt-3'
            link={links.workspaceMenuActions}
            onClick={e => {
              e.stopPropagation()
              if (actionsMenuSlice.openedMenu.value) actionsMenuSlice.closeMenu()
              else actionsMenuSlice.openActionsMenu()
            }}
          >
            {actionsMenuSlice.openedMenu.value ? (
              <>
                {/* <FaAngleLeft /> */}
                Добавление...
              </>
            ) : (
              <>
                <FaPlus />
                Добавить
              </>
            )}
          </Button>

          {actionsMenuSlice.openedMenu.value &&
            (!actionsMenuSlice.openedActionClass.value ? (
              <div class='mt-3 grid grid-cols-2 gap-3 px-3'>
                {actionsMenuSlice.actionClasses.map(({ name, icon, ref }) => (
                  <Button
                    key={ref.ref.addr}
                    link={ref.ref.addr}
                    class='h-24 flex-col gap-y-1 text-center text-sm'
                    onClick={e => {
                      e.stopPropagation()
                      actionsMenuSlice.openActionsClass(ref)
                    }}
                  >
                    <PlaygroundOptionTypeIcon icon={icon} />
                    {name}
                  </Button>
                ))}
              </div>
            ) : (
              <>
                <Button
                  class='mt-3'
                  link={actionsMenuSlice.openedActionClass.value}
                  onClick={e => {
                    e.stopPropagation()
                    actionsMenuSlice.closeActionClass()
                  }}
                >
                  {actionsMenuSlice.openedActionClassName.value ?? ''}
                </Button>
                {!actionsMenuSlice.openedAction[0] ? (
                  <div class='mx-3 mt-3 flex max-h-72 flex-col gap-y-2 overflow-y-auto rounded px-2 scroll-default'>
                    {actionsMenuSlice.actions.length ? (
                      actionsMenuSlice.actions.map(({ name, ref, actionClassAddr }) =>
                        actionClassAddr === actionsMenuSlice.openedActionClass.value ? (
                          <Button
                            key={ref.ref.addr}
                            link={ref.ref.addr}
                            onClick={e => {
                              e.stopPropagation()
                              actionsMenuSlice.openAction(ref)
                            }}
                          >
                            {name}
                          </Button>
                        ) : null
                      )
                    ) : (
                      <div class='gap-2 rounded border-transparent text-gray-700 centeric'>- - -</div>
                    )}
                  </div>
                ) : (
                  <>
                    <Button
                      class='mt-3'
                      link={actionsMenuSlice.openedAction[0].ref.ref.addr}
                      onClick={e => {
                        e.stopPropagation()
                        actionsMenuSlice.closeAction()
                      }}
                    >
                      {actionsMenuSlice.openedAction[0]?.name}
                    </Button>

                    <div class='mt-3 flex-wrap gap-3 px-3 centeric'>
                      {actionsMenuSlice.openedArguments.value.map(({ title, value, selected }, index) => (
                        <Button
                          class={`relative h-20 !w-32 flex-col gap-y-1 text-center text-sm ${selected ? 'border-primary bg-gray-100' : '!text-gray-400 hover:border-gray-300'}`}
                          onClick={() => actionsMenuSlice.setArgSelector(index)}
                        >
                          <span class='text-xl'>{value ? <PiSelectionAllFill /> : <PiSelectionBold />}</span>
                          {value ? String(value) : title}
                          <span class='absolute right-1.5 top-1.5 text-xs'>{index + 1}</span>
                        </Button>
                      ))}
                      {actionsMenuSlice.openedArguments.value.every(_ => _.value) && (
                        <Button
                          class='w-[16.75rem] text-center text-sm'
                          onClick={() => executeAction(actionsMenuSlice.openedArguments.value.map(_ => _.value!))}
                        >
                          Готово
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </>
            ))}
        </div>
      </div>
      <div />
    </div>
  )
}
