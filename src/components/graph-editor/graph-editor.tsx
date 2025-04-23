import { EdgeType, Graph, GraphElements } from '@ennealand/enigraph'
import { useSignal } from '@preact/signals'
import { DeepSignal, deepSignal } from 'deepsignal'
import { useEffect } from 'preact/hooks'
import { JSX } from 'preact/jsx-runtime'
import { CgArrowsExpandUpRight } from 'react-icons/cg'
import { LuPencilLine, LuTrash2 } from 'react-icons/lu'
import { MdOutlineCategory } from 'react-icons/md'
import { PiSelectionAllBold } from 'react-icons/pi'
import { actionsMenuSlice, editorSlice } from '../../store/slices/workspace'

type Props = {
  w: number
  h: number
} & JSX.HTMLAttributes<HTMLDivElement>

export const GraphComponent = ({ w, h, ...props }: Props) => {
  const elements = useSignal<DeepSignal<GraphElements> | undefined>(undefined)

  useEffect(() => {
    const effect = async () => {
      elements.value = deepSignal({ nodes: [], edges: [], groups: [] })
      // elements.value.$nodes!.value = workspace.vertices.map(v => ({ ...v, x: 0, y: 0 }))
      // elements.value.edges = workspace.edges.value.map(e => ({ ...e, source: { ...e.source, x: 0, y: 0 }, target: { ...e.target, x: 0, y: 0 } }))
      // setTimeout(() => {
      elements.value.$edges = editorSlice.edges
      elements.value.$groups = editorSlice.groups
      elements.value.$nodes = editorSlice.vertices
      // }, 20);
    }
    effect()
  }, [])

  return (
    <div {...props} style={{ minWidth: w || 'calc(100% - 360px)', minHeight: h || '100%' }}>
      {elements.value ? (
        <Graph
          elements={elements.value}
          addNode={editorSlice.addNode}
          addEdge={editorSlice.addEdge}
          addGroup={editorSlice.addGroup}
          changeNodeLabel={editorSlice.changeNodeLabel}
          width={w}
          height={h}
          padding={15}
          edgeTypes={[EdgeType.ArcConst, EdgeType.EdgeConst, EdgeType.ArcConstPermPosAccess]}
          objectSelection={actionsMenuSlice.groupSelection.value}
          changeNodePosition={editorSlice.changeNodePosition}
          nodePositionChanged={editorSlice.nodePositionChanged}
          removeNode={editorSlice.removeNode}
          buttonIcons={{
            type: <MdOutlineCategory />,
            arrow: <CgArrowsExpandUpRight />,
            group: <PiSelectionAllBold />,
            rename: <LuPencilLine />,
            delete: <LuTrash2 />,
          }}
        />
      ) : (
        <div style={{ width: w, height: h }}></div>
      )}
    </div>
  )
}
