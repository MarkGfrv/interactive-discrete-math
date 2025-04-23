import { EdgeType, NodeType } from '@ennealand/enigraph'
import { ScType } from '@ennealand/enneract'
import { View } from './slices/navigation'
import { PlaygroundOptionTypeIcons } from '../components/playground/option-type-icon'

export interface App {
  AppView: {
    name: View
  }
  AppNavigationSlice: {
    current_view: 'AppView'
    current_addr: 'AppWorkspace'
  }
  AppWorkspace: {
    name: string
    elementVertex: 'Vertex'
    elementEdge: 'Edge'
    elementGroup: 'Group'
    tools: 'AppWorkspaceToolsSlice'
  }

  ElementVertex: {
    x: number
    y: number
  }

  ElementEdge: {
    source: 'ElementVertex'
    target: 'ElementVertex'
  }

  ElementGroup: {
    elements: 'SetOfElementVertices'
    to: 'AnotherGroup'
  }

  SetOfElementVertices: {
    element: 'ElementVertex'
  }

  Vertex: {
    customType: NodeType
    name: string
    sc: ScType
  }
  Edge: {
    sc: ScType.EdgeUCommonVar | ScType.EdgeDCommonVar | ScType.EdgeAccessVarPosPerm
    from: 'Vertex'
    to: 'Vertex'
    customType: EdgeType
    name: string
  }
  AnotherGroup: {
    element_vertex: 'AnotherVertex'
    sc: ScType.NodeVarStruct
  }
  AnotherVertex: {
    customType: NodeType
    name: string
    sc: ScType
  }
  Group: {
    element_vertex: 'Vertex'
    element_oredge: 'Edge'
    element_edge: 'Edge'
    sc: ScType.NodeVarStruct
  }

  Question: {
    element: 'Runner'
    result: 'Result'
  }

  Result: {
    element_1: 'AnotherGroup'
  }

  Runner: {
    name: string
    element_1: 'Group' | 'AnotherGroup'
    element_2: 'Group' | 'AnotherGroup' | 'AgentArg'
    element_3: 'AgentArg'
  }

  WorkspaceMenu: {
    decomposition: 'SetOfActionClasses'
  }

  SetOfActionClasses: {
    element: 'ActionClass'
  }

  ActionClass: {
    buttonName: string
    icon: PlaygroundOptionTypeIcons
    decomposition: 'SetOfActions'
  }

  SetOfActions: {
    element: 'Action'
  }

  Action: {
    buttonName: string
    agentArg: 'AgentArg'
    agentType: 'AgentType'
  }

  AgentArg: {}

  AgentType: {
    element: 'Question'
  }

  AppWorkspaceToolsSlice: {
    opened: 'Action'
    argSelector: number
    args: 'SetOfGroups'
    properties: 'SetOfActiveActions'
  }

  SetOfActiveActions: {
    element: 'ActiveAction'
  }

  ActiveAction: {
    action: 'Action'
    args: 'SetOfGroups'
    status: 'ActiveActionStatus'
    value: number
  }

  ActiveActionStatus: {
    name: 'True' | 'False' | 'Details' | 'Unknown'
  }

  SetOfGroups: {
    element_1: 'ElementGroup_'
    element_2: 'ElementGroup_'
    element_3: 'ElementGroup_'
  }
  ElementGroup_: {
    to: 'Group_'
  }
  Group_: {}

  NumericValue: {
    value: number
  }
}
