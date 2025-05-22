import { AppWorkspace } from './core.ts'

/**
 * Reset workspace sc-memory state to default mock state.
 */
export const resetWorkspace = async () => {
  const slice = (await AppWorkspace`example`.ref.one)!
  await slice.elementEdge.ref.delete
  await slice.elementVertex.ref.delete
  await slice.elementGroup.ref.delete
}
