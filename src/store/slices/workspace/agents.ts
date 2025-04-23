import { actionsMenuSlice } from '.'
import { simulate } from '../../../components/graph-editor/simulation.ts'
import {
  ActiveAction,
  ActiveActionStatus,
  AgentType,
  AppNavigationSlice,
  AppWorkspace,
  ElementGroup,
  Group,
  NumericValue,
  Question,
  RefValue,
  Runner,
  SetOfElementVertices,
  SetOfGroups,
} from '../../core.ts'

const initializeAgent = (args: number[], agentArg: RefValue<'AgentArg'>) => {
  if (args.length === 2) {
    const activeParamsQuery = {
      element_1: ElementGroup`${args[0]}` as never as RefValue<'ElementGroup_'>,
      element_2: ElementGroup`${args[1]}` as never as RefValue<'ElementGroup_'>,
    }

    const runner = {
      element_1: ElementGroup`${args[0]}`.to,
      element_2: ElementGroup`${args[1]}`.to,
      element_3: agentArg,
    }

    return [activeParamsQuery, runner] as const
  }

  const activeParamsQuery = {
    element_1: ElementGroup`${args[0]}` as never as RefValue<'ElementGroup_'>,
  }

  const runner = {
    element_1: ElementGroup`${args[0]}`.to,
    element_2: agentArg,
  }

  return [activeParamsQuery, runner] as const
}

export const executeAction = async (args: number[]) => {
  const workspace = await AppNavigationSlice`default`.current_addr.where(AppWorkspace).ref.one
  const openedAction = actionsMenuSlice.openedAction[0]
  if (!actionsMenuSlice || !workspace || !openedAction) {
    console.error('Something went wrong.. ', { actionsMenuSlice, workspace, openedAction })
    return
  }

  if (args.length === 1) {
    // @ts-ignore
    await openedAction.agentArg.element.unlink(ElementGroup`${args[0]}`)
  } else if (args.length === 2) {
    // Super dummy hack sdhfskjdhfusdhfukdhjghsjdfgbkjsfdbg (add)
    const g1 = ElementGroup`${args[0]}`.to as unknown as RefValue<'Group'>
    const g2 = ElementGroup`${args[1]}`.to as unknown as RefValue<'Group'>
    console.logDarkCyan('hack linked', await g1.element_oredge.link(g1.element_edge))
    console.logDarkCyan('hack linked', await g2.element_oredge.link(g2.element_edge))
  }

  const [activeParamsQuery, runner] = initializeAgent(args, openedAction.agentArg)
  const activeParams = await new SetOfGroups(activeParamsQuery).create
  const activeAction = await new ActiveAction({
    action: openedAction.ref,
    args: activeParams,
    status: args.length === 2 ? ActiveActionStatus`details` : ActiveActionStatus`unknown`,
    is: { element: workspace.tools.properties },
  }).create
  actionsMenuSlice.closeMenu()

  const question = await new Question({
    element: new Runner(runner),
  }).create

  await openedAction.agentType.element.link(question)
  await AgentType.$`action_initiated`.element.link(question)
  console.log(question)

  const solution = await question.result.element_1.ref.addr.one.reactive

  const unsubscribe = solution.subscribe(async solutionAddr => {
    console.log('Solution addr:', solutionAddr)
    if (!solutionAddr) return
    unsubscribe()

    if (args.length === 2) {
      // Super dummy hack sdhfskjdhfusdhfukdhjghsjdfgbkjsfdbg (remove)
      const g1 = ElementGroup`${args[0]}`.to as unknown as RefValue<'Group'>
      const g2 = ElementGroup`${args[1]}`.to as unknown as RefValue<'Group'>
      g1.element_oredge.unlink(g1.element_edge).then(n => console.logDarkCyan('hack unlinked', n))
      g2.element_oredge.unlink(g2.element_edge).then(n => console.logDarkCyan('hack unlinked', n))

      await processGraphResult(workspace, activeParams, solutionAddr)
    } else {
      const value = await NumericValue`${solutionAddr}`.value.one
      if (value !== undefined) {
        // Process numeric value
        activeAction.value.link(value)
        activeAction.status.update(ActiveActionStatus`true`)
        return
      }
      // Process classification result
      // @ts-ignore
      const fool = await ElementGroup`${args[0]}`.to.is.element.ref.addr.many
      const success = fool.includes(openedAction.agentArg.ref.addr)
      activeAction.status.update(success ? ActiveActionStatus`true` : ActiveActionStatus`false`)
    }
  })
}

// const processClassificationResult = async (workspace: RefValue<'AppWorkspace'>, activeParams: RefValue<'SetOfGroups'>, solutionAddr: number) => {

// }

const processGraphResult = async (workspace: RefValue<'AppWorkspace'>, activeParams: RefValue<'SetOfGroups'>, solutionAddr: number) => {
  // Wrap the solution addr into RefValue
  const group = Group`${solutionAddr}`

  // Put the solution into active action result arg
  activeParams.element_3.link(group as never)

  // Get the list of actual vertices inside the solution graph
  const vertices = await group.element_vertex.ref.many
  console.log(vertices)

  // Get the list of actual oredges inside the solution graph
  const oredges = await group.element_oredge.get({ ref: true, from: { ref: { addr: 'from' } }, to: { ref: { addr: 'to' } } })

  // Get the list of actual edges inside the solution graph
  const nonoredges = await group.element_edge.get({ ref: true, from: { ref: { addr: 'from' } }, to: { ref: { addr: 'to' } } })

  // Create a set for new "views" of the vertices inside the workspace
  const elementsReq = new SetOfElementVertices().create

  // Generate positions of the vertices
  const nodes = vertices.map(vertex => ({ id: vertex.ref.addr, x: 0, y: 0, vertex }))
  const edges = oredges.map(edge => {
    const sourceIndex = nodes.findIndex(n => n.id === edge.from)
    const targetIndex = nodes.findIndex(n => n.id === edge.to)
    return { id: edge.ref.ref.addr, source: nodes[sourceIndex], target: nodes[targetIndex], sourceIndex, targetIndex, value: edge.ref }
  })
  nonoredges.forEach(edge => {
    const sourceIndex = nodes.findIndex(n => n.id === edge.from)
    const targetIndex = nodes.findIndex(n => n.id === edge.to)
    edges.push({ id: edge.ref.ref.addr, source: nodes[sourceIndex], target: nodes[targetIndex], sourceIndex, targetIndex, value: edge.ref })
  })
  simulate({ nodes, edges }, { strength: -16 })

  // Await the creation of a set for new "views" of the vertices inside the workspace
  const elements = await elementsReq

  // Create new "view" of the vertices inside the workspace and push it to the set
  const relations = await Promise.all(
    nodes.map(node => workspace.elementVertex.link(node.vertex, { x: node.x, y: node.y, is: { element: elements } }))
  )

  // Create new "view" of the edges inside the workspace
  await Promise.all(
    edges.map(edge => workspace.elementEdge.link(edge.value, { source: relations[edge.sourceIndex], target: relations[edge.targetIndex] }))
  )

  await Promise.all([
    // Assiciate new "view" of the group inside the workspace with the set of new "views" of the vertices
    elements.element.link(relations),

    // Create new "view" of the group inside the workspace with its attributes
    workspace.elementGroup.link(group, { elements }),

    // Make the solution a Group
    Group.element.link(group),
  ])
}
