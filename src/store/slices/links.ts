import { getKeynode } from '../core'

/** Defines sc-addr links (leading to opening new tabs in sc-web) */
export const links = {
  graphTheory: await getKeynode('section_graph_theory_hierarchy'),
  setTheory: await getKeynode('set_theory_knowledge_base'),

  workspaceMenuActions: await getKeynode('workspace_menu_actions'),

  documentationGraphTheory: await getKeynode('doc_graph_theory'),

  scnCode: await getKeynode('scn_code'),
  scgCode: await getKeynode('scg_code'),
  dmCode: await getKeynode('dm_code'),

  switchToScn() {
    ;(document.querySelector(`a[sc_addr="${this.scnCode}"]`) as any)?.click()
  },
  switchToScg() {
    ;(document.querySelector(`a[sc_addr="${this.scgCode}"]`) as any)?.click()
  },
}
