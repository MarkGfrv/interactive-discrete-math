import { EdgeType, GraphEdge, GraphGroup, GraphNode, NodeType } from '@ennealand/enigraph'
import { ScType, deepSignal, smartBatch } from '@ennealand/enneract'
import { computed, signal } from '@preact/signals'
import {
  AppNavigationSlice,
  AppWorkspace,
  Edge,
  ElementEdge,
  ElementGroup,
  ElementVertex,
  Group,
  RefValue,
  SetOfElementVertices,
  Vertex,
} from '../../core.ts'
import { $defined } from '../../utils.ts'

const workspaceRef = await AppNavigationSlice`default`.current_addr.where(AppWorkspace).ref.addr.one.reactive

type GraphNodeExtended = GraphNode & { addr: number }
type GraphEdgeExtended = GraphEdge & {
  source: GraphNodeExtended
  target: GraphNodeExtended
}

// Reset the workspace state:
// await import('../../reset.ts').then(mod => mod.resetWorkspace())

const getVertices = (slice: RefValue<'AppWorkspace'>) => {
  return slice.elementVertex.get({
    relation: { x: 'x', y: 'y', ref: { addr: 'id' } },
    ref: { addr: 'addr' },
    customType: 'type',
    name: 'label',
  }).reactive
}

const getEdgeIds = (slice: RefValue<'AppWorkspace'>) => {
  return slice.elementEdge.get({
    relation: { source: { ref: { addr: 'source' } }, target: { ref: { addr: 'target' } }, ref: { addr: 'id' } },
    from: { ref: { addr: 'from' } },
    to: { ref: { addr: 'to' } },
    customType: 'type',
    ref: { addr: 'addr' },
  }).reactive
}

const getGroupsArray = (slice: RefValue<'AppWorkspace'>) => {
  return slice.elementGroup.get({
    ref: { addr: 'addr' },
    relation: { ref: { addr: 'id' }, elements: { element: { ref: { addr: 'element' } } } },
  }).reactive
}

/** Array of vertices data in the workspace */
const vertices = signal<Awaited<ReturnType<typeof getVertices>> extends (infer T)[] ? T[] & Partial<Disposable> : never>([])

/** Array of edges data in the workspace */
const edgeIds = signal<Awaited<ReturnType<typeof getEdgeIds>> extends (infer T)[] ? T[] & Partial<Disposable> : never>([])

/** Array of groups data in the workspace */
const groupsArray = signal<Awaited<ReturnType<typeof getGroupsArray>> extends (infer T)[] ? T[] & Partial<Disposable> : never>([])

const slice = signal<RefValue<'AppWorkspace'> | null>(null)

workspaceRef.subscribe(async newValue => {
  if (vertices.peek()) vertices.peek()[Symbol.dispose]?.()
  if (edgeIds.peek()) edgeIds.peek()[Symbol.dispose]?.()
  if (groupsArray.peek()) edgeIds.peek()[Symbol.dispose]?.()
  console.logOrangeRed('Unsubscribed from workspace elements', vertices.peek().length + edgeIds.peek().length + groupsArray.peek().length)

  if (!newValue) {
    slice.value = null
    vertices.value = []
    edgeIds.value = []
    groupsArray.value = []
    return
  }

  slice.value = AppWorkspace`${newValue}`
  vertices.value = await getVertices(slice.value)
  edgeIds.value = await getEdgeIds(slice.value)
  groupsArray.value = await getGroupsArray(slice.value)
  console.logLightSkyBlue('Subscribed to workspace elements', vertices.peek().length + edgeIds.peek().length + groupsArray.peek().length)
  // return () => {
  //   console.warn('ooopsic')
  // }
})

/** Array of edges data in the workspace with sources and targets mapped to reactive vertices */
const edges = computed(() =>
  edgeIds.value
    .map<GraphEdgeExtended | undefined>(edge => {
      const source = vertices.value.find(v => v.id === edge.source)
      const target = vertices.value.find(v => v.id === edge.target)
      if (!source || !target) {
        // console.log({ ...edge }, vertices.map(_ => ({ ..._ })))
        // console.error('source or target is missing')
        return
      }
      return { source, target, id: edge.id, type: edge.type }
    })
    .filter($defined)
)

const groups = computed(() => {
  const result = new Map<number, GraphGroup>()
  for (const group of groupsArray.value) {
    let existing = result.get(group.id)
    if (!existing)
      result.set(group.id, (existing = { id: group.id, label: '', values: new Set(), position: { bottom: 0, left: 0, right: 0, top: 0 } }))
    existing.values.add(group.element)
  }
  // console.logMediumSeaGreen('groups:', result)
  return deepSignal(Array.from(result.values()))
})

/**
 * Helper map object to associate newly created temporal node objects with the promises of their new ids.
 * This is primarly used when creating both new nodes and edge to wait for node ids to be resolved first.
 */
const newNodeIds = new WeakMap<GraphNode, { addr: Promise<number>; id: Promise<number> }>()

/**
 * Create a new graph node in sc-memory associated with the current workspace.\
 * Update the local state by pusing new node with its new sc-addr used as id to eliminate
 * delay of receiving an update from sc-memory. Save the node id promise in `newNodeIds`
 * in case it's a part of larger creation construction.
 * @param node GraphNode object with all information about new node
 */
const addNode = async (node: GraphNode) => {
  if (!slice.value) return
  let name = ''
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i)
    if (takenLetters.has(letter)) continue
    takenLetters.add(letter)
    name = letter
    break
  }
  const newVertex = new Vertex({
    customType: node.type,
    name,
    is: { elementVertex: { value: slice.value, relation: { x: node.x, y: node.y } } },
  }).create
  const id = newVertex.then(v => v.relations[0])
  const addr = newVertex.then(v => v.ref.addr)
  newNodeIds.set(node, { id, addr })
  vertices.value.push({ label: name, type: node.type, x: node.x, y: node.y, id: await id, addr: await addr })
}
const takenLetters = new Set<string>()

/**
 * Create a new graph edge in sc-memory associated with the current workspace.\
 * Having source/target ids resolved preliminarily, update the local state by pusing new edge
 * with its new sc-addr used as id to eliminate delay of receiving an update from sc-memory.
 * @param node GraphEdge object with all information about new edge
 */
const addEdge = async (edge: GraphEdgeExtended) => {
  if (edge.source.id === edge.target.id) return
  const from = edge.source.addr || (await newNodeIds.get(edge.source)!.addr)
  const to = edge.target.addr || (await newNodeIds.get(edge.target)!.addr)
  const source = edge.source.id || (await newNodeIds.get(edge.source)!.id)
  const target = edge.target.id || (await newNodeIds.get(edge.target)!.id)
  await smartAddEdge({ from, to, source, target, type: edge.type })
}

const smartAddEdge = async (edge: { from: number; to: number; source: number; target: number; type: EdgeType }, root = edgeIds.value) => {
  if (!slice.value) return
  // Check if the edge already exists and thus only its "view" should be added.
  const existingEdge = root.find(e => e.from === edge.from && e.to === edge.to && e.type === edge.type)
  if (existingEdge) {
    const relation = await slice.value.elementEdge.link(Edge`${existingEdge.addr}`, {
      source: ElementVertex`${edge.source}`,
      target: ElementVertex`${edge.target}`,
    })
    edgeIds.value.push({ ...edge, id: relation.ref.addr, addr: existingEdge.addr })
    if (edgeIds.value !== root) root.push({ ...edge, id: relation.ref.addr, addr: existingEdge.addr })
    console.logMediumSeaGreen('Edge created:', `id ${relation.ref.addr}`)
    return
  }
  const scmatch = {
    [EdgeType.ArcConst]: ScType.EdgeDCommonVar,
    [EdgeType.EdgeConst]: ScType.EdgeUCommonVar,
    [EdgeType.ArcConstPermPosAccess]: ScType.EdgeAccessVarPosPerm,
    [EdgeType.ArcConstPermNegAccess]: ScType.EdgeAccessVarPosPerm,
    [EdgeType.ArcConstPermFuzAccess]: ScType.EdgeAccessVarPosPerm,
  } as const
  const newEdge = await new Edge({
    from: Vertex`${edge.from}`,
    to: Vertex`${edge.to}`,
    sc: scmatch[edge.type],
    customType: edge.type,
    is: { elementEdge: { value: slice.value, relation: { source: ElementVertex`${edge.source}`, target: ElementVertex`${edge.target}` } } },
  }).create
  edgeIds.value.push({ ...edge, id: newEdge.relations[0], addr: newEdge.ref.addr })
  if (edgeIds.value !== root) root.push({ ...edge, id: newEdge.relations[0], addr: newEdge.ref.addr })
  console.logMediumSeaGreen('Edge created:', `addr ${newEdge.ref.addr}`)
}

const smartDeleteEdge = async (edge: { addr: number; id: number }, root = edgeIds.value) => {
  const anotherEdge = root.some(e => e.addr === edge.addr && e.id !== edge.id)
  const edgeIndex = root.findIndex(e => e.id === edge.id)
  if (edgeIndex !== -1) root.splice(edgeIndex, 1)
  if (anotherEdge) await ElementEdge`${edge.id}`.ref.delete
  else await Edge`${edge.addr}`.ref.delete
  console.logDeepPink('Edge deleted:', anotherEdge ? `id ${edge.id}` : `addr ${edge.addr}`)
}

const smartAddVertex = async (
  vertex: { label: string; x: number; y: number; type: NodeType; id?: number; addr?: number },
  root = vertices.value
) => {
  if (!slice.value) return { ...vertex, id: 0, addr: 0 }
  const existingNode = root.find(v => v.label === vertex.label)
  if (existingNode) {
    const relation = await slice.value.elementVertex.link(Vertex`${existingNode.addr}`, { x: vertex.x, y: vertex.y })
    console.logMediumSeaGreen('Vertex created:', `id ${relation.ref.addr}`)
    return { ...vertex, id: relation.ref.addr, addr: existingNode.addr, type: existingNode.type }
  } else {
    const newVertex = await new Vertex({
      customType: vertex.type,
      name: vertex.label,
      sc: ScType.NodeVarClass,
      is: { elementVertex: { value: slice.value, relation: { x: vertex.x, y: vertex.y } } },
    }).create
    takenLetters.add(vertex.label)
    console.logMediumSeaGreen('Vertex created:', `addr ${vertex.addr}`)
    return { ...vertex, id: newVertex.relations[0], addr: newVertex.ref.addr }
  }
}

const smartDeleteVertex = async (node: { addr: number; id: number; label?: string }, root = vertices.value) => {
  const anotherVertex = root.some(v => v.addr === node.addr && v.id !== node.id)
  if (anotherVertex) await ElementVertex`${node.id}`.ref.delete
  else {
    node.label && takenLetters.delete(node.label)
    await Vertex`${node.addr}`.ref.delete
  }
  console.logDeepPink('Vertex deleted:', anotherVertex ? `id ${node.id}` : `addr ${node.addr}`)
}

/**
 * Create a new graph group in sc-memory associated with the current workspace.
 * Update the local state by pusing new group with its new sc-addr used as id to
 * eliminate delay of receiving an update from sc-memory.
 * @param node GraphGroup object with all information about new edge
 */
const addGroup = async (group: GraphGroup) => {
  if (!slice.value) return
  const elements = await new SetOfElementVertices().create
  const newGroup = await new Group({ sc: ScType.NodeVarStruct, is: { elementGroup: { value: slice.value, relation: { elements } } } })
    .create
  for (const element of group.values) groupsArray.value.push({ addr: newGroup.ref.addr, id: newGroup.relations[0], element })
  await Promise.all([
    elements.element.link(Array.from(group.values).map(id => ElementVertex`${id}`)),
    newGroup.element_vertex.link(vertices.value.filter(vertex => group.values.has(vertex.id)).map(vertex => Vertex`${vertex.addr}}`)),
    newGroup.element_oredge.link(
      edgeIds.value
        .filter(e => e.type === EdgeType.ArcConst && group.values.has(e.source) && group.values.has(e.target))
        .map(e => Edge`${e.addr}}`)
    ),
    newGroup.element_edge.link(
      edgeIds.value
        .filter(e => e.type === EdgeType.EdgeConst && group.values.has(e.source) && group.values.has(e.target))
        .map(e => Edge`${e.addr}}`)
    ),
  ])
}

/**
 * Change the node label to a new one in both sc-memory associated with the current workspace
 * and local state.
 * @param node GraphNode object the label belongs to
 * @param label The new label value
 */
const changeNodeLabel = async (reactiveNode: GraphNodeExtended, label: string) => {
  if (reactiveNode.label === label) return
  await smartBatch(async () => {
    const untrackedVertices = vertices.value.map(_ => ({ ..._ }))
    const untrackedEdgeIds = edgeIds.value.map(_ => ({ ..._ }))
    const mutableUntrackedEdgeIds = edgeIds.value.map(_ => ({ ..._ }))
    const untrackedGroupArray = groupsArray.value.map(_ => ({ ..._ }))
    const node = { ...reactiveNode }
    reactiveNode.label = label
    const vertex = await smartAddVertex({ ...node, label }, untrackedVertices)
    reactiveNode.type = vertex.type
    for (const edge of untrackedEdgeIds) {
      if (edge.source === node.id) {
        await smartAddEdge(
          { from: vertex.addr, to: edge.to, source: vertex.id, target: edge.target, type: edge.type },
          mutableUntrackedEdgeIds
        )
        await smartDeleteEdge(edge, mutableUntrackedEdgeIds)
      }
      if (edge.target === node.id) {
        await smartAddEdge(
          { from: edge.from, to: vertex.addr, source: edge.source, target: vertex.id, type: edge.type },
          mutableUntrackedEdgeIds
        )
        await smartDeleteEdge(edge, mutableUntrackedEdgeIds)
      }
    }
    for (const group of untrackedGroupArray) {
      if (group.element === node.id) {
        console.logDarkOrange('Redefining group vertex', vertex.addr, node.addr, vertex.id, node.id)
        const anotherVertex = untrackedGroupArray.some(
          g => g.element !== node.id && untrackedVertices.some(v => v.id === g.element && v.addr === node.addr)
        )
        console.warn(anotherVertex)
        if (!anotherVertex) {
          Group`${group.addr}`.element_vertex.link(Vertex`${vertex.addr}`)
          Group`${group.addr}`.element_vertex.unlink(Vertex`${node.addr}`)
        } else {
          ElementGroup`${group.id}`.elements.element.unlink(ElementVertex`${node.id}`)
        }
        await ElementGroup`${group.id}`.elements.element.link(ElementVertex`${vertex.id}`)
      }
    }
    smartDeleteVertex(node, untrackedVertices)
  }, [vertices.value, edgeIds.value, groupsArray.value])
}

/**
 * Change the node position to a new one in both sc-memory associated with the current workspace
 * and local state.
 * @param node GraphNode object the label belongs to
 * @param x The new x-coordinate
 * @param y The new y-coordinate
 */
const changeNodePosition = async (node: GraphNode, x: number, y: number) => {
  node.x = x
  node.y = y
  // await ElementVertex`${node.id}`.x.write(x)
  // await ElementVertex`${node.id}`.y.write(y)
}

const nodePositionChanged = async (node: GraphNode) => {
  await smartBatch(
    () => Promise.all([ElementVertex`${node.id}`.x.update(node.x), ElementVertex`${node.id}`.y.update(node.y)]),
    [vertices.value]
  )
}

const removeNode = async (id: number) => {
  for (const edge of edgeIds.value) {
    if (edge.source === id || edge.target === id) {
      smartDeleteEdge(edge)
    }
  }
  const vertex = vertices.value.find(v => v.id === id)
  if (vertex) smartDeleteVertex(vertex)
}

/** Workspace store slice */
export const editorSlice = {
  addEdge,
  addGroup,
  addNode,
  changeNodeLabel,
  changeNodePosition,
  nodePositionChanged,
  edges,
  groups,
  removeNode,
  vertices,
}
