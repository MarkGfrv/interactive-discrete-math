import { smartBatch } from '@ennealand/enneract'
import { AppNavigationSlice, AppView, AppWorkspace, AppWorkspaceToolsSlice, SetOfActiveActions, SetOfGroups } from '../core.ts'

export enum View {
  Landing = 'Landing',
  KnowledgeBase = 'KnowledgeBase',
  ConceptMap = 'ConceptMap',
  TaskModule = 'TaskModule',
  Playground = 'Playground',
}

const slice = (await AppNavigationSlice`default`.ref.one)!

/** Defines general in-app navigation between different Views */
export const navigation = {
  /** Currently active application view */
  view: await slice.current_view.name.one.reactive,

  /** The identifier of current sandbox object */
  current: await slice.current_addr.ref.addr.one.reactive,

  /** List of spaces available */
  spaces: await AppWorkspace.element.get({ ref: { addr: 'addr' }, name: true }).reactive,

  /**
   * Opens a task module
   * @param taskId Id of the task module to open
   */
  openTask(_taskId: string) {
    slice.current_view.update(AppView`task_module`)
    // slice.current_addr.update(taskId)
  },

  /**
   * Opens a workspace (playground)
   * @param taskId Id of the workspace to open
   */
  openSpace(spaceAddr: number) {
    slice.current_view.update(AppView`playground`)
    slice.current_addr.update(AppWorkspace`${spaceAddr}` as never)
  },

  /** Creates a new workspace (playground) */
  async createSpace() {
    slice.current_addr.link(
      new AppWorkspace({
        name: '',
        tools: new AppWorkspaceToolsSlice({
          args: new SetOfGroups(),
          properties: new SetOfActiveActions(),
        }),
      }) as never
    )
    slice.current_view.update(AppView`playground`)
  },

  /** Renames current workspace (playground) */
  renameSpace(name: string) {
    smartBatch(() => AppWorkspace`${this.current.value}`.name.update(name), [this.spaces])
  },

  /** Deletes current workspace (playground) */
  deleteSpace() {
    AppWorkspace`${this.current.value}`.ref.delete
    this.gotoLanding()
  },

  /**
   * Switches back to Layout view
   */
  gotoLanding() {
    slice.current_view.update(AppView`landing`)
    slice.current_addr.unlink()
  },
}
