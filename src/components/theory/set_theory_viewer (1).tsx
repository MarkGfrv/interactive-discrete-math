import { useEffect, useState } from 'preact/hooks';
import { ScAddr, ScClient, ScTemplate, ScType, ScHelper } from 'ts-sc-client';

export const SetTheoryViewer = () => {
  const client = new ScClient('ws://localhost:8090/ws_json');
  const helper = new ScHelper(client);
  const [sectionNames, setSectionNames] = useState([]);

  async function fetchSection() {
  console.log('start section fetching...');
  const { subjectDomainOfSetTheory } = await client.searchKeynodes("subject_domain_of_set_theory");
  const { nrelSectionDecomposition } = await client.searchKeynodes("nrel_section_decomposition");

  async function buildSectionTree(sectionAddr): Promise<{
    name: string;
    subsections: any[];
  }> {
    const name = await helper.getMainIdentifier(sectionAddr, "lang_ru");
    const subsections = await findSubsections(sectionAddr);
    const subsectionTrees = await Promise.all(
      subsections.map(addr => buildSectionTree(addr))
    );
    return {
      addr: sectionAddr,
      name,
      subsections: subsectionTrees
    };
  }

  async function findSubsections(parentAddr: ScAddr): Promise<ScAddr[]> {
    const sectionAlias = "_section";
    const textAlias = "_text";
    const template = new ScTemplate();
    
    template.quintuple(
      [ScType.VarNode, sectionAlias],
      ScType.VarCommonArc,
      parentAddr,
      ScType.VarPermPosArc,
      nrelSectionDecomposition
    );
    template.triple(
      sectionAlias,
      ScType.VarPermPosArc,
      [ScType.VarNode, textAlias]
    );
    const res = await client.searchByTemplate(template);
    return res.map(item => item.get(textAlias));
  }
  const sectionTree = await buildSectionTree(subjectDomainOfSetTheory);
  console.log('Section tree:', sectionTree);
  return sectionTree;
  }
  
  useEffect(() => {
  const loadData = async () => {
    console.log('start loading data...');
    try {
      const sectionsArray = await fetchSection();
      console.log('Sections array:', sectionsArray); 
      const sectionNamesTemp = [];
      for (let i = 0; i < sectionsArray.length; i++){
        const sectName = await helper.getMainIdentifier(sectionsArray[i], "lang_ru");
        sectionNamesTemp.push(sectName);
      }
      setSectionNames(sectionNamesTemp);
      
      console.log('domain of sets section names', sectionNamesTemp);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  loadData(); 
}, []);
};
