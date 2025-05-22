import { ReadonlySignal, Signal, computed, effect, signal } from '@preact/signals'
import { ActiveAction, AppNavigationSlice, AppWorkspace, Group, RefValue } from '../../core.ts'
const slice = AppNavigationSlice`default`.current_addr.where(AppWorkspace).tools

const activeActionRefs = await slice.properties.element.get({
  ref: true,
  args: { ref: 'argsRef' },
  action: { ref: 'actionRef' },
}).reactive

type Args = {
  addr: number
  args: number[]
  result: number
  value: number
  status: 'True' | 'False' | 'Details' | 'Unknown'
  agent: { agentArg: RefValue<'AgentArg'>; agentType: RefValue<'AgentType'>; name: string }
} & Disposable
const args: Signal<ReadonlySignal<Args[]>> = signal(signal([]))

effect(async () => {
  for (const arg of args.peek().peek()) arg[Symbol.dispose]()
  console.logDeepPink('Unsubscribed from active actions:', args.peek().peek().length)
  const signals = await Promise.all(
    activeActionRefs.map(action =>
      Promise.all([
        action.ref.ref.addr,
        action.argsRef.element_1.to.ref.addr.one.reactive,
        action.argsRef.element_2.to.ref.addr.one.reactive,
        action.argsRef.element_3.where(Group as never).ref.addr.one.reactive,
        action.ref.value.one.reactive,
        action.ref.status.name.one.reactive,
        action.actionRef.get({ agentArg: { ref: 'agentArg' }, agentType: { ref: 'agentType' }, buttonName: 'name' }).reactive,
      ])
    )
  )

  args.value = computed(() =>
    signals.map(([addr, e1, e2, e3, value, status, agent]) => ({
      addr,
      args: [e1.value, e2.value],
      result: e3.value,
      status: status.value,
      value: value.value,
      agent: agent[0],
      [Symbol.dispose]: () => {
        e1[Symbol.dispose]()
        e2[Symbol.dispose]()
        e3[Symbol.dispose]()
        value[Symbol.dispose]()
        status[Symbol.dispose]()
        agent[Symbol.dispose]()
      },
    }))
  )
  console.logMediumSeaGreen('Subscribed to active actions:', signals.length)
  return () => {
    console.logDeepPink('Unsubscribed from active actions:')
    signals.forEach(args => args.forEach(arg => typeof arg === 'object' && arg[Symbol.dispose]()))
  }
})

const activeActions = computed(() => args.value.value)

const deleteActiveAction = (addr: number) => {
  ActiveAction`${addr}`.ref.delete
}

export const activeActionsSlice = {
  activeActions,
  deleteActiveAction,
}
