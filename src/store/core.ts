import { Enneract } from '@ennealand/enneract'
import { DeepSignal } from 'deepsignal'
import type { Magic } from '../../node_modules/@ennealand/enneract/dist/types/magic-types.d.ts'
import { App } from './types.ts'

const port = 8090;
console.log("port is ", port);
const url = 'ws://localhost:' + port + '/ws_json'
console.log("url is ", url);
const enneract = new Enneract<App>(url, { reconnect: true });
export const {
  AppNavigationSlice,
  AppView,
  AppWorkspace,
  Edge,
  Group,
  Vertex,
  ElementVertex,
  ElementEdge,
  ElementGroup,
  NumericValue,
  SetOfElementVertices,
  ActionClass,
  ActiveAction,
  ActiveActionStatus,
  AppWorkspaceToolsSlice,
  SetOfActionClasses,
  SetOfActiveActions,
  SetOfGroups,
  WorkspaceMenu,
  SetOfActions,
  Action,
  AgentArg,
  AgentType,
  Question,
  Runner,
} = enneract.magic as Magic<App>

export type RefValue<T extends keyof App> = NonNullable<Awaited<Magic<App>[T]['element']['ref']['one']>>

export const getKeynode = enneract.engine.getKeynode.bind(enneract.engine)

export const $extract = <T extends unknown>(args: T[]) => args[0] as Required<DeepSignal<T>>
