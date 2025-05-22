import { useEffect, useState } from 'preact/hooks';
import { ScAddr, ScClient, ScTemplate, ScType, ScHelper } from 'ts-sc-client';

export const GraphTheoryViewer = () => {
  // Состояния
  const [currentPage, setCurrentPage] = useState(1);
  const [renderedHtml, setRenderedHtml] = useState('');
  const [language, setLanguage] = useState<'ru' | 'eng'>('ru');
  const [sectionTitle, setSectionTitle] = useState('');
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'sections'|'topics'|'content'|'video'|'test'>('sections');
  const client = new ScClient('ws://localhost:8090/ws_json');
  const helper = new ScHelper(client);
  const [rus1, setRus1] = useState<any>(null);
  const [eng1, setEng1] = useState<any>(null);
  const [sectionNames, setSectionNames] = useState([]);
  const [engSectionNames, setEngSectionNames] = useState([]);
  const [rusTheoryFromSect, setRusTheoryFromSect] = useState([]);
  const [engTheoryFromSect, setEngTheoryFromSect] = useState([]);
  const [rusVideoFromSect, setRusVideoFromSect] = useState([]);
  const [testQuestions, setTestQuestions] = useState([]);
  const [testAnswers, setTestAnswers] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [entestQuestions, setEnTestQuestions] = useState([]);
  const [entestAnswers, setEnTestAnswers] = useState([]);
  const [encorrectAnswers, setEnCorrectAnswers] = useState([]);
  const [userAnswers, setUserAnswers] = useState<Record<string,string>>({});
  const [testResult, setTestResult] = useState<number|null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  async function fetchSection() {
    console.log('start section fetching...');
    const { sectionSubjectDomainOfNGraph } = await client.searchKeynodes("section_subject_domain_of_n_graph");
    const { nrelSectionDecomposition } = await client.searchKeynodes("nrel_section_decomposition");
    console.log("Section address is equal to", sectionSubjectDomainOfNGraph);
    console.log("Address is equal to", nrelSectionDecomposition);
    const sectionAlias = "_section";
    const textAlias = "_text";
    const template = new ScTemplate();
    template.quintuple(
      [ScType.VarNode, sectionAlias],
      ScType.VarCommonArc,
      sectionSubjectDomainOfNGraph,
      ScType.VarPermPosArc,
      nrelSectionDecomposition
    );
    template.triple(
      sectionAlias,
      ScType.VarPermPosArc,
      [ScType.VarNode, textAlias]
    );
    const res = await client.searchByTemplate(template);
    if (!res.length) {
      console.log('cannot find subsections for section!');
      return new ScAddr(0);
    }
    console.log('section fetched succesfully', res);
    const results = [];
    const resLength = res.length;
    for (let i = 0; i < resLength; i++) {
      const sectionNew = res[i].get(textAlias);
      console.log('Fetching section with addr: ', sectionNew);
      const templateInner = new ScTemplate();
      templateInner.quintuple(
        [ScType.VarNode, sectionAlias],
        ScType.VarCommonArc,
        sectionNew,
        ScType.VarPermPosArc,
        nrelSectionDecomposition
      );
      templateInner.triple(
        sectionAlias,
        ScType.VarPermPosArc,
        [ScType.VarNode, textAlias]
      );
      const newres = await client.searchByTemplate(templateInner);
      console.log("newres", newres);
      if (!newres.length) {
        results.push(res[i].get(textAlias))
      } else {
        for (let i = 0; i < newres.length; i++){
          results.push(newres[i].get(textAlias));
        }
      }
    }
    console.log('sections fetched succesfully: ', results);
    return results;
  }
  
  async function fetchTheory(specificSection) {
    console.log('start section fetching...');
    const { nrelScTextTranslation, langRu } = await client.searchKeynodes("nrel_sc_text_translation", "lang_ru");
    console.log("Section address is equal to", specificSection);
    const translationAlias = "_translation";
    const textAlias = "_text";
    const template = new ScTemplate();
    template.quintuple(
      [ScType.VarNode, translationAlias],
      ScType.VarCommonArc,
      specificSection,
      ScType.VarPermPosArc,
      nrelScTextTranslation
    );
    template.triple(
      translationAlias,
      ScType.VarPermPosArc,
      [ScType.VarNodeLink, textAlias]
    );
    template.triple(
    langRu,
    ScType.VarPermPosArc,
    textAlias
    );
    const res = await client.searchByTemplate(template);
    if (!res.length) {
      console.log('cannot find theory for section!');
      return new ScAddr(0);
    }
    console.log('theory fetched succesfully', res);
    const linkContent = ( await client.getLinkContents([res[0].get(textAlias)]) )[0];
    console.log('links content: ', linkContent._data);
    return linkContent._data;
  }
  
  async function fetchEngTheory(specificSection) {
    console.log('start section fetching...');
    const { nrelScTextTranslation, langEn } = await client.searchKeynodes("nrel_sc_text_translation", "lang_en");
    console.log("Section address is equal to", specificSection);
    const translationAlias = "_translation";
    const textAlias = "_text";
    const template = new ScTemplate();
    template.quintuple(
      [ScType.VarNode, translationAlias],
      ScType.VarCommonArc,
      specificSection,
      ScType.VarPermPosArc,
      nrelScTextTranslation
    );
    template.triple(
      translationAlias,
      ScType.VarPermPosArc,
      [ScType.VarNodeLink, textAlias]
    );
    template.triple(
    langEn,
    ScType.VarPermPosArc,
    textAlias
    );
    const res = await client.searchByTemplate(template);
    if (!res.length) {
      console.log('cannot find theory for section!');
      return new ScAddr(0);
    }
    console.log('theory fetched succesfully', res);
    const linkContent = ( await client.getLinkContents([res[0].get(textAlias)]) )[0];
    console.log('links content: ', linkContent._data);
    return linkContent._data;
  }
  
  async function fetchVideo(specificSection) {
    console.log('start video fetching...');
    const { nrelYoutubeLessonUrl, formatYoutubeUrl, nrelFormat } = await client.searchKeynodes("nrel_youtube_lesson_url", "format_youtube_url", "nrel_format");
    console.log("Section address is equal to", specificSection);
    const videoAlias = "_video";
    const textAlias = "_text";
    const template = new ScTemplate();
    template.quintuple(
      specificSection,
      ScType.VarCommonArc,
      [ScType.VarNodeLink, videoAlias],
      ScType.VarPermPosArc,
      nrelYoutubeLessonUrl
    );
    template.quintuple(
      videoAlias,
      ScType.VarCommonArc,
      formatYoutubeUrl,
      ScType.VarPermPosArc,
      nrelFormat
    );
    const res = await client.searchByTemplate(template);
    if (!res.length) {
      console.log('cannot find video for section!');
      return new ScAddr(0);
    }
    console.log('video fetched succesfully', res);
    const results = [];
    for (let i = 0; i < res.length; i++){
      const linkContent = ( await client.getLinkContents([res[i].get(videoAlias)]) )[0];
      console.log('video links content: ', linkContent._data);
      results.push(linkContent._data);
    }
    console.log('video links content: ', results);
    return results;
  }
  
  async function fetchQuestions(specificSection) {
    console.log('start test fetching...');
    const { nrelTest } = await client.searchKeynodes("nrel_test");
    console.log("Section address is equal to", specificSection);
    const testAlias = "_test";
    const questionAlias = "_question";
    const answerAlias = "_answer";
    const newAnswerAlias = "_answer2";
    const template = new ScTemplate();
    template.quintuple(
      [ScType.VarNode, testAlias],
      ScType.VarCommonArc,
      specificSection,
      ScType.VarPermPosArc,
      nrelTest
    );
    template.triple(
      testAlias,
      ScType.VarPermPosArc,
      [ScType.VarNodeLink, questionAlias]
    );
    const res = await client.searchByTemplate(template);
    if (!res.length) {
      console.log('cannot find answer for question!');
      return new ScAddr(0);
    }
    const results = [];
    for (let i = 0; i < res.length; i++){
      const linkContent = ( await client.getLinkContents([res[i].get(questionAlias)]) )[0];
      console.log('questions content: ', linkContent._data);
      results.push(linkContent._data);
    }
    return results;
  }
  
  async function fetchAnswers(specificSection){
    console.log('start answer fetching...');
    const { nrelTest } = await client.searchKeynodes("nrel_test");
    console.log("Section address is equal to", specificSection);
    const testAlias = "_test";
    const questionAlias = "_question";
    const answerAlias = "_answer";
    const template = new ScTemplate();
    template.quintuple(
      [ScType.VarNode, testAlias],
      ScType.VarCommonArc,
      specificSection,
      ScType.VarPermPosArc,
      nrelTest
    );
    template.triple(
      testAlias,
      ScType.VarPermPosArc,
      [ScType.VarNodeLink, questionAlias]
    );
    template.triple(
      questionAlias,
      ScType.VarPermPosArc,
      [ScType.VarNodeLink, answerAlias],
    );
    const res = await client.searchByTemplate(template);
    if (!res.length) {
      console.log('cannot find answer for question!');
      return new ScAddr(0);
    }
    const results = [];
    for (let i = 0; i < res.length; i++){
      const linkContent = ( await client.getLinkContents([res[i].get(answerAlias)]) )[0];
      console.log('answers content: ', linkContent._data);
      results.push(linkContent._data);
    }
    return results;
  }
  
  async function fetchCorrectAnswer(specificSection) {
    console.log('start answer fetching...');
    const { nrelTest, rrelCorrectAnswer } = await client.searchKeynodes("nrel_test", "rrel_correct_answer");
    console.log("Section address is equal to", specificSection);
    const testAlias = "_test";
    const questionAlias = "_question";
    const answerAlias = "_answer";
    const template = new ScTemplate();
    template.quintuple(
      [ScType.VarNode, testAlias],
      ScType.VarCommonArc,
      specificSection,
      ScType.VarPermPosArc,
      nrelTest
    );
    template.triple(
      testAlias,
      ScType.VarPermPosArc,
      [ScType.VarNodeLink, questionAlias]
    );
    template.quintuple(
      questionAlias,
      ScType.VarPermPosArc,
      [ScType.VarNodeLink, answerAlias],
      ScType.VarPermPosArc,
      rrelCorrectAnswer
    );
    const res = await client.searchByTemplate(template);
    if (!res.length) {
      console.log('cannot find answer for question!');
      return new ScAddr(0);
    }
    const results = [];
    for (let i = 0; i < res.length; i++){
      const linkContent = ( await client.getLinkContents([res[i].get(answerAlias)]) )[0];
      console.log('correct answer content: ', linkContent._data);
      results.push(linkContent._data);
    }
    return results;
  }
  
  async function fetchEnQuestions(specificSection) {
    console.log('start test fetching...');
    const { nrelEnTest } = await client.searchKeynodes("nrel_en_test");
    console.log("Section address is equal to", specificSection);
    const testAlias = "_test";
    const questionAlias = "_question";
    const answerAlias = "_answer";
    const newAnswerAlias = "_answer2";
    const template = new ScTemplate();
    template.quintuple(
      [ScType.VarNode, testAlias],
      ScType.VarCommonArc,
      specificSection,
      ScType.VarPermPosArc,
      nrelEnTest
    );
    template.triple(
      testAlias,
      ScType.VarPermPosArc,
      [ScType.VarNodeLink, questionAlias]
    );
    const res = await client.searchByTemplate(template);
    if (!res.length) {
      console.log('cannot find answer for question!');
      return new ScAddr(0);
    }
    const results = [];
    for (let i = 0; i < res.length; i++){
      const linkContent = ( await client.getLinkContents([res[i].get(questionAlias)]) )[0];
      console.log('en questions content: ', linkContent._data);
      results.push(linkContent._data);
    }
    return results;
  }
  
  async function fetchEnAnswers(specificSection){
    console.log('start answer fetching...');
    const { nrelEnTest } = await client.searchKeynodes("nrel_en_test");
    console.log("Section address is equal to", specificSection);
    const testAlias = "_test";
    const questionAlias = "_question";
    const answerAlias = "_answer";
    const template = new ScTemplate();
    template.quintuple(
      [ScType.VarNode, testAlias],
      ScType.VarCommonArc,
      specificSection,
      ScType.VarPermPosArc,
      nrelEnTest
    );
    template.triple(
      testAlias,
      ScType.VarPermPosArc,
      [ScType.VarNodeLink, questionAlias]
    );
    template.triple(
      questionAlias,
      ScType.VarPermPosArc,
      [ScType.VarNodeLink, answerAlias],
    );
    const res = await client.searchByTemplate(template);
    if (!res.length) {
      console.log('cannot find answer for question!');
      return new ScAddr(0);
    }
    const results = [];
    for (let i = 0; i < res.length; i++){
      const linkContent = ( await client.getLinkContents([res[i].get(answerAlias)]) )[0];
      console.log('en answers content: ', linkContent._data);
      results.push(linkContent._data);
    }
    return results;
  }
  
  async function fetchEnCorrectAnswer(specificSection) {
    console.log('start answer fetching...');
    const { nrelEnTest, rrelCorrectAnswer } = await client.searchKeynodes("nrel_en_test", "rrel_correct_answer");
    console.log("Section address is equal to", specificSection);
    const testAlias = "_test";
    const questionAlias = "_question";
    const answerAlias = "_answer";
    const template = new ScTemplate();
    template.quintuple(
      [ScType.VarNode, testAlias],
      ScType.VarCommonArc,
      specificSection,
      ScType.VarPermPosArc,
      nrelEnTest
    );
    template.triple(
      testAlias,
      ScType.VarPermPosArc,
      [ScType.VarNodeLink, questionAlias]
    );
    template.quintuple(
      questionAlias,
      ScType.VarPermPosArc,
      [ScType.VarNodeLink, answerAlias],
      ScType.VarPermPosArc,
      rrelCorrectAnswer
    );
    const res = await client.searchByTemplate(template);
    if (!res.length) {
      console.log('cannot find answer for question!');
      return new ScAddr(0);
    }
    const results = [];
    for (let i = 0; i < res.length; i++){
      const linkContent = ( await client.getLinkContents([res[i].get(answerAlias)]) )[0];
      console.log('en correct answer content: ', linkContent._data);
      results.push(linkContent._data);
    }
    return results;
  }
  
  console.log('file is loaded');
  useEffect(() => {
  const loadData = async () => {
    console.log('start loading data...');
    try {
      const sectionsArray = await fetchSection();
      console.log('Sections array:', sectionsArray); 
      const sectionNamesTemp = [];
      const engSectionNamesTemp = [];
      const rusTheoryFromSectTemp = [];
      const engTheoryFromSectTemp = [];
      const rusVideoFromSectTemp = [];
      const testQuestionsTemp = [];
      const testAnswersTemp = [];
      const correctAnswersTemp = [];
      const entestQuestionsTemp = [];
      const entestAnswersTemp = [];
      const encorrectAnswersTemp = [];
      for (let i = 0; i < sectionsArray.length; i++){
        const sectName = await helper.getMainIdentifier(sectionsArray[i], "lang_ru");
        const sectEnName = await helper.getMainIdentifier(sectionsArray[i], "lang_en");
        const res1 = await fetchTheory(sectionsArray[i]);
        const res2 = await fetchEngTheory(sectionsArray[i]);
        const res3 = await fetchVideo(sectionsArray[i]);
        const res4 = await fetchAnswers(sectionsArray[i]);
        const res5 = await fetchQuestions(sectionsArray[i]);
        const res6 = await fetchCorrectAnswer(sectionsArray[i]);
        const res7 = await fetchEnAnswers(sectionsArray[i]);
        const res8 = await fetchEnQuestions(sectionsArray[i]);
        const res9 = await fetchEnCorrectAnswer(sectionsArray[i]);
        sectionNamesTemp.push(sectName);
        engSectionNamesTemp.push(sectEnName);
        rusTheoryFromSectTemp.push(res1);
        engTheoryFromSectTemp.push(res2);
        rusVideoFromSectTemp.push(res3);
        testAnswersTemp.push(res4);
        testQuestionsTemp.push(res5);
        correctAnswersTemp.push(res6);
        entestAnswersTemp.push(res7);
        entestQuestionsTemp.push(res8);
        encorrectAnswersTemp.push(res9);
      }
      setSectionNames(sectionNamesTemp);
      setEngSectionNames(engSectionNamesTemp);
      setRusTheoryFromSect(rusTheoryFromSectTemp);
      setEngTheoryFromSect(engTheoryFromSectTemp);
      setRusVideoFromSect(rusVideoFromSectTemp);
      setTestQuestions(testQuestionsTemp);
      setTestAnswers(testAnswersTemp);
      setCorrectAnswers(correctAnswersTemp);
      setEnTestQuestions(entestQuestionsTemp);
      setEnTestAnswers(entestAnswersTemp);
      setEnCorrectAnswers(encorrectAnswersTemp);
      
      console.log('section names', sectionNamesTemp);
      console.log('theory loaded success', rusTheoryFromSectTemp);
      console.log('video loaded success', rusVideoFromSectTemp);
      console.log('questions fetched success', testQuestionsTemp);
      console.log('answers fetched success', testAnswersTemp);
      console.log('correct answers fetched success', correctAnswersTemp);
      console.log('en questions fetched success', entestQuestionsTemp);
      console.log('en answers fetched success', entestAnswersTemp);
      console.log('en correct answers fetched success', encorrectAnswersTemp);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  loadData(); 
}, []);

  if (rusVideoFromSect.length === 0 || sectionNames.length === 0) {
  return <div>Загрузка...</div>;
  }

  // Полные данные разделов и тем
  const sections = [
    { 
      id: 1, 
      name: 'Первый раздел', 
      nameEng: 'First section',
      topics: [
        { 
          id: 1, 
          name: sectionNames[0], 
          nameEng: engSectionNames[0], 
          page: 1, 
          contents: {
            ru: rusTheoryFromSect[0],
            eng: engTheoryFromSect[0]
          },
          videoUrls: {
            ru: rusVideoFromSect[0][0],
            eng: rusVideoFromSect[0][1]
          },
          test: {
            question1: {
                question: testQuestions[0][0],
                answer1: testAnswers[0][0],
                answer2: testAnswers[0][1],
                answer3: testAnswers[0][2],
                correctanswer: correctAnswers[0][0]
            },
            question2: {
                question: testQuestions[0][1],
                answer1: testAnswers[0][3],
                answer2: testAnswers[0][4],
                answer3: testAnswers[0][5],
                correctanswer: correctAnswers[0][1]
            },
            question3: {
                question: testQuestions[0][2],
                answer1: testAnswers[0][6],
                answer2: testAnswers[0][7],
                answer3: testAnswers[0][20],
                correctanswer: correctAnswers[0][2]
            },
            question4: {
                question: testQuestions[0][3],
                answer1: testAnswers[0][15],
                answer2: testAnswers[0][18],
                answer3: testAnswers[0][16],
                correctanswer: correctAnswers[0][3]
            },
            question5: {
                question: testQuestions[0][4],
                answer1: testAnswers[0][17],
                answer2: testAnswers[0][19],
                answer3: testAnswers[0][14],
                correctanswer: correctAnswers[0][4]
            },
            question6: {
                question: testQuestions[0][5],
                answer1: testAnswers[0][13],
                answer2: testAnswers[0][12],
                answer3: testAnswers[0][11],
                correctanswer: correctAnswers[0][5]
            },
            question7: {
                question: testQuestions[0][6],
                answer1: testAnswers[0][10],
                answer2: testAnswers[0][9],
                answer3: testAnswers[0][8],
                correctanswer: correctAnswers[0][6]
            }
          },
          en_test: {
            question1: {
                question: entestQuestions[0][0],
                answer1: entestAnswers[0][0],
                answer2: entestAnswers[0][1],
                answer3: entestAnswers[0][2],
                correctanswer: encorrectAnswers[0][0]
            },
            question2: {
                question: entestQuestions[0][1],
                answer1: entestAnswers[0][3],
                answer2: entestAnswers[0][4],
                answer3: entestAnswers[0][5],
                correctanswer: encorrectAnswers[0][1]
            },
            question3: {
                question: entestQuestions[0][2],
                answer1: entestAnswers[0][6],
                answer2: entestAnswers[0][7],
                answer3: entestAnswers[0][20],
                correctanswer: encorrectAnswers[0][2]
            },
            question4: {
                question: entestQuestions[0][3],
                answer1: entestAnswers[0][15],
                answer2: entestAnswers[0][18],
                answer3: entestAnswers[0][16],
                correctanswer: encorrectAnswers[0][3]
            },
            question5: {
                question: entestQuestions[0][4],
                answer1: entestAnswers[0][17],
                answer2: entestAnswers[0][19],
                answer3: entestAnswers[0][14],
                correctanswer: encorrectAnswers[0][4]
            },
            question6: {
                question: entestQuestions[0][5],
                answer1: entestAnswers[0][13],
                answer2: entestAnswers[0][12],
                answer3: entestAnswers[0][11],
                correctanswer: encorrectAnswers[0][5]
            },
            question7: {
                question: entestQuestions[0][6],
                answer1: entestAnswers[0][10],
                answer2: entestAnswers[0][9],
                answer3: entestAnswers[0][8],
                correctanswer: encorrectAnswers[0][6]
            }
          }
        },
        { 
          id: 2, 
          name: sectionNames[1], 
          nameEng: engSectionNames[1], 
          page: 2, 
          contents: {
            ru: rusTheoryFromSect[1],
            eng: engTheoryFromSect[1]
          },
          videoUrls: {
            ru: rusVideoFromSect[1][0],
            eng: rusVideoFromSect[1][1]
          },
          test: {
            question1: {
                question: testQuestions[1][0],
                answer1: testAnswers[1][0],
                answer2: testAnswers[1][1],
                answer3: testAnswers[1][2],
                correctanswer: correctAnswers[1][0]
            },
            question2: {
                question: testQuestions[1][1],
                answer1: testAnswers[1][3],
                answer2: testAnswers[1][16],
                correctanswer: correctAnswers[1][1]
            },
            question3: {
                question: testQuestions[1][2],
                answer1: testAnswers[1][15],
                answer2: testAnswers[1][14],
                answer3: testAnswers[1][13],
                correctanswer: correctAnswers[1][2]
            },
            question4: {
                question: testQuestions[1][3],
                answer1: testAnswers[1][12],
                answer2: testAnswers[1][11],
                answer3: testAnswers[1][10],
                correctanswer: correctAnswers[1][3]
            },
            question5: {
                question: testQuestions[1][4],
                answer1: testAnswers[1][9],
                answer2: testAnswers[1][8],
                answer3: testAnswers[1][7],
                correctanswer: correctAnswers[1][4]
            },
            question6: {
                question: testQuestions[1][5],
                answer1: testAnswers[1][6],
                answer2: testAnswers[1][5],
                answer3: testAnswers[1][4],
                correctanswer: correctAnswers[1][5]
            }
          },
          en_test: {
            question1: {
                question: entestQuestions[1][0],
                answer1: entestAnswers[1][0],
                answer2: entestAnswers[1][1],
                answer3: entestAnswers[1][2],
                correctanswer: encorrectAnswers[1][0]
            },
            question2: {
                question: entestQuestions[1][1],
                answer1: entestAnswers[1][3],
                answer2: entestAnswers[1][16],
                correctanswer: encorrectAnswers[1][1]
            },
            question3: {
                question: entestQuestions[1][2],
                answer1: entestAnswers[1][15],
                answer2: entestAnswers[1][14],
                answer3: entestAnswers[1][13],
                correctanswer: encorrectAnswers[1][2]
            },
            question4: {
                question: entestQuestions[1][3],
                answer1: entestAnswers[1][12],
                answer2: entestAnswers[1][11],
                answer3: entestAnswers[1][10],
                correctanswer: encorrectAnswers[1][3]
            },
            question5: {
                question: entestQuestions[1][4],
                answer1: entestAnswers[1][9],
                answer2: entestAnswers[1][8],
                answer3: entestAnswers[1][7],
                correctanswer: encorrectAnswers[1][4]
            },
            question6: {
                question: entestQuestions[1][5],
                answer1: entestAnswers[1][6],
                answer2: entestAnswers[1][5],
                answer3: entestAnswers[1][4],
                correctanswer: encorrectAnswers[1][5]
            }
          }
        }
      ]
    },
    { 
      id: 2, 
      name: 'Второй раздел', 
      nameEng: 'Second section',
      topics: [
        { id: 1, name: sectionNames[2], nameEng: engSectionNames[2], page: 3, contents: {
            ru: rusTheoryFromSect[2],
            eng: engTheoryFromSect[2]
          }, videoUrls: { ru: rusVideoFromSect[2][0], eng: rusVideoFromSect[2][1] }, test: {
            question1: {
                question: testQuestions[2][0],
                answer1: testAnswers[2][0],
                answer2: testAnswers[2][1],
                answer3: testAnswers[2][14],
                correctanswer: correctAnswers[2][0]
            },
            question2: {
                question: testQuestions[2][1],
                answer1: testAnswers[2][13],
                answer2: testAnswers[2][12],
                answer3: testAnswers[2][11],
                correctanswer: correctAnswers[2][1]
            },
            question3: {
                question: testQuestions[2][2],
                answer1: testAnswers[2][10],
                answer2: testAnswers[2][9],
                answer3: testAnswers[2][8],
                correctanswer: correctAnswers[2][2]
            },
            question4: {
                question: testQuestions[2][3],
                answer1: testAnswers[2][7],
                answer2: testAnswers[2][6],
                answer3: testAnswers[2][5],
                correctanswer: correctAnswers[2][3]
            },
            question5: {
                question: testQuestions[2][4],
                answer1: testAnswers[2][4],
                answer2: testAnswers[2][3],
                answer3: testAnswers[2][2],
                correctanswer: correctAnswers[2][4]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[2][0],
                answer1: entestAnswers[2][0],
                answer2: entestAnswers[2][1],
                answer3: entestAnswers[2][14],
                correctanswer: encorrectAnswers[2][0]
            },
            question2: {
                question: entestQuestions[2][1],
                answer1: entestAnswers[2][13],
                answer2: entestAnswers[2][12],
                answer3: entestAnswers[2][11],
                correctanswer: encorrectAnswers[2][1]
            },
            question3: {
                question: entestQuestions[2][2],
                answer1: entestAnswers[2][10],
                answer2: entestAnswers[2][9],
                answer3: entestAnswers[2][8],
                correctanswer: encorrectAnswers[2][2]
            },
            question4: {
                question: entestQuestions[2][3],
                answer1: entestAnswers[2][7],
                answer2: entestAnswers[2][6],
                answer3: entestAnswers[2][5],
                correctanswer: encorrectAnswers[2][3]
            },
            question5: {
                question: entestQuestions[2][4],
                answer1: entestAnswers[2][4],
                answer2: entestAnswers[2][3],
                answer3: entestAnswers[2][2],
                correctanswer: encorrectAnswers[2][4]
            }
          } },
        { id: 2, name: sectionNames[3], nameEng: engSectionNames[3], page: 4, contents: {
            ru: rusTheoryFromSect[3],
            eng: engTheoryFromSect[3]
          }, videoUrls: { ru: rusVideoFromSect[3][0], eng: rusVideoFromSect[3][1] }, test: {
            question1: {
                question: testQuestions[3][0],
                answer1: testAnswers[3][0],
                answer2: testAnswers[3][1],
                answer3: testAnswers[3][14],
                correctanswer: correctAnswers[3][0]
            },
            question2: {
                question: testQuestions[3][1],
                answer1: testAnswers[3][13],
                answer2: testAnswers[3][12],
                answer3: testAnswers[3][11],
                correctanswer: correctAnswers[3][1]
            },
            question3: {
                question: testQuestions[3][2],
                answer1: testAnswers[3][10],
                answer2: testAnswers[3][9],
                answer3: testAnswers[3][8],
                correctanswer: correctAnswers[3][2]
            },
            question4: {
                question: testQuestions[3][3],
                answer1: testAnswers[3][7],
                answer2: testAnswers[3][6],
                answer3: testAnswers[3][5],
                correctanswer: correctAnswers[3][3]
            },
            question5: {
                question: testQuestions[3][4],
                answer1: testAnswers[3][4],
                answer2: testAnswers[3][3],
                answer3: testAnswers[3][2],
                correctanswer: correctAnswers[3][4]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[3][0],
                answer1: entestAnswers[3][0],
                answer2: entestAnswers[3][1],
                answer3: entestAnswers[3][14],
                correctanswer: encorrectAnswers[3][0]
            },
            question2: {
                question: entestQuestions[3][1],
                answer1: entestAnswers[3][13],
                answer2: entestAnswers[3][12],
                answer3: entestAnswers[3][11],
                correctanswer: encorrectAnswers[3][1]
            },
            question3: {
                question: entestQuestions[3][2],
                answer1: entestAnswers[3][10],
                answer2: entestAnswers[3][9],
                answer3: entestAnswers[3][8],
                correctanswer: encorrectAnswers[3][2]
            },
            question4: {
                question: entestQuestions[3][3],
                answer1: entestAnswers[3][7],
                answer2: entestAnswers[3][6],
                answer3: entestAnswers[3][5],
                correctanswer: encorrectAnswers[3][3]
            },
            question5: {
                question: entestQuestions[3][4],
                answer1: entestAnswers[3][4],
                answer2: entestAnswers[3][3],
                answer3: entestAnswers[3][2],
                correctanswer: encorrectAnswers[3][4]
            }
          } },
        { id: 3, name: sectionNames[4], nameEng: engSectionNames[4], page: 5, contents: {
            ru: rusTheoryFromSect[4],
            eng: engTheoryFromSect[4]
          }, videoUrls: { ru: rusVideoFromSect[4][0], eng: rusVideoFromSect[4][1] }, test: {
            question1: {
                question: testQuestions[4][0],
                answer1: testAnswers[4][0],
                answer2: testAnswers[4][1],
                answer3: testAnswers[4][14],
                correctanswer: correctAnswers[4][0]
            },
            question2: {
                question: testQuestions[4][1],
                answer1: testAnswers[4][13],
                answer2: testAnswers[4][12],
                answer3: testAnswers[4][11],
                correctanswer: correctAnswers[4][1]
            },
            question3: {
                question: testQuestions[4][2],
                answer1: testAnswers[4][10],
                answer2: testAnswers[4][9],
                answer3: testAnswers[4][8],
                correctanswer: correctAnswers[4][2]
            },
            question4: {
                question: testQuestions[4][3],
                answer1: testAnswers[4][7],
                answer2: testAnswers[4][6],
                answer3: testAnswers[4][5],
                correctanswer: correctAnswers[4][3]
            },
            question5: {
                question: testQuestions[4][4],
                answer1: testAnswers[4][4],
                answer2: testAnswers[4][3],
                answer3: testAnswers[4][2],
                correctanswer: correctAnswers[4][4]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[4][0],
                answer1: entestAnswers[4][0],
                answer2: entestAnswers[4][1],
                answer3: entestAnswers[4][14],
                correctanswer: encorrectAnswers[4][0]
            },
            question2: {
                question: entestQuestions[4][1],
                answer1: entestAnswers[4][13],
                answer2: entestAnswers[4][12],
                answer3: entestAnswers[4][11],
                correctanswer: encorrectAnswers[4][1]
            },
            question3: {
                question: entestQuestions[4][2],
                answer1: entestAnswers[4][10],
                answer2: entestAnswers[4][9],
                answer3: entestAnswers[4][8],
                correctanswer: encorrectAnswers[4][2]
            },
            question4: {
                question: entestQuestions[4][3],
                answer1: entestAnswers[4][7],
                answer2: entestAnswers[4][6],
                answer3: entestAnswers[4][5],
                correctanswer: encorrectAnswers[4][3]
            },
            question5: {
                question: entestQuestions[4][4],
                answer1: entestAnswers[4][4],
                answer2: entestAnswers[4][3],
                answer3: entestAnswers[4][2],
                correctanswer: encorrectAnswers[4][4]
            }
          } },
        { id: 4, name: sectionNames[5], nameEng: engSectionNames[5], page: 6, contents: {
            ru: rusTheoryFromSect[5],
            eng: engTheoryFromSect[5]
          }, videoUrls: { ru: rusVideoFromSect[5][0], eng: rusVideoFromSect[5][1] }, test: {
            question1: {
                question: testQuestions[5][0],
                answer1: testAnswers[5][0],
                answer2: testAnswers[5][13],
                correctanswer: correctAnswers[5][0]
            },
            question2: {
                question: testQuestions[5][1],
                answer1: testAnswers[5][12],
                answer2: testAnswers[5][11],
                answer3: testAnswers[5][10],
                correctanswer: correctAnswers[5][1]
            },
            question3: {
                question: testQuestions[5][2],
                answer1: testAnswers[5][9],
                answer2: testAnswers[5][8],
                answer3: testAnswers[5][7],
                correctanswer: correctAnswers[5][2]
            },
            question4: {
                question: testQuestions[5][3],
                answer1: testAnswers[5][6],
                answer2: testAnswers[5][5],
                answer3: testAnswers[5][4],
                correctanswer: correctAnswers[5][3]
            },
            question5: {
                question: testQuestions[5][4],
                answer1: testAnswers[5][3],
                answer2: testAnswers[5][2],
                answer3: testAnswers[5][1],
                correctanswer: correctAnswers[5][4]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[5][0],
                answer1: entestAnswers[5][0],
                answer2: entestAnswers[5][13],
                correctanswer: encorrectAnswers[5][0]
            },
            question2: {
                question: entestQuestions[5][1],
                answer1: entestAnswers[5][12],
                answer2: entestAnswers[5][11],
                answer3: entestAnswers[5][10],
                correctanswer: encorrectAnswers[5][1]
            },
            question3: {
                question: entestQuestions[5][2],
                answer1: entestAnswers[5][9],
                answer2: entestAnswers[5][8],
                answer3: entestAnswers[5][7],
                correctanswer: encorrectAnswers[5][2]
            },
            question4: {
                question: entestQuestions[5][3],
                answer1: entestAnswers[5][6],
                answer2: entestAnswers[5][5],
                answer3: entestAnswers[5][4],
                correctanswer: encorrectAnswers[5][3]
            },
            question5: {
                question: entestQuestions[5][4],
                answer1: entestAnswers[5][3],
                answer2: entestAnswers[5][2],
                answer3: entestAnswers[5][1],
                correctanswer: encorrectAnswers[5][4]
            }
          } },
        { id: 5, name: sectionNames[6], nameEng: engSectionNames[6], page: 7, contents: {
            ru: rusTheoryFromSect[6],
            eng: engTheoryFromSect[6]
          }, videoUrls: { ru: rusVideoFromSect[6][0], eng: rusVideoFromSect[6][1] }, test: {
            question1: {
                question: testQuestions[6][0],
                answer1: testAnswers[6][0],
                answer2: testAnswers[6][1],
                correctanswer: correctAnswers[6][0]
            },
            question2: {
                question: testQuestions[6][1],
                answer1: testAnswers[6][2],
                answer2: testAnswers[6][3],
                answer3: testAnswers[6][4],
                correctanswer: correctAnswers[6][1]
            },
            question3: {
                question: testQuestions[6][2],
                answer1: testAnswers[6][5],
                answer2: testAnswers[6][6],
                correctanswer: correctAnswers[6][2]
            },
            question4: {
                question: testQuestions[6][3],
                answer1: testAnswers[6][7],
                answer2: testAnswers[6][8],
                answer3: testAnswers[6][9],
                correctanswer: correctAnswers[6][3]
            },
            question5: {
                question: testQuestions[6][4],
                answer1: testAnswers[6][10],
                answer2: testAnswers[6][11],
                answer3: testAnswers[6][12],
                correctanswer: correctAnswers[6][4]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[6][0],
                answer1: entestAnswers[6][0],
                answer2: entestAnswers[6][1],
                correctanswer: encorrectAnswers[6][0]
            },
            question2: {
                question: entestQuestions[6][1],
                answer1: entestAnswers[6][2],
                answer2: entestAnswers[6][3],
                answer3: entestAnswers[6][4],
                correctanswer: encorrectAnswers[6][1]
            },
            question3: {
                question: entestQuestions[6][2],
                answer1: entestAnswers[6][5],
                answer2: entestAnswers[6][6],
                correctanswer: encorrectAnswers[6][2]
            },
            question4: {
                question: entestQuestions[6][3],
                answer1: entestAnswers[6][7],
                answer2: entestAnswers[6][8],
                answer3: entestAnswers[6][9],
                correctanswer: encorrectAnswers[6][3]
            },
            question5: {
                question: entestQuestions[6][4],
                answer1: entestAnswers[6][10],
                answer2: entestAnswers[6][11],
                answer3: entestAnswers[6][12],
                correctanswer: encorrectAnswers[6][4]
            }
          } },
        { id: 6, name: sectionNames[7], nameEng: engSectionNames[7], page: 8, contents: {
            ru: rusTheoryFromSect[7],
            eng: engTheoryFromSect[7]
          }, videoUrls: { ru: rusVideoFromSect[7][0], eng: rusVideoFromSect[7][1] }, test: {
            question1: {
                question: testQuestions[7][0],
                answer1: testAnswers[7][0],
                answer2: testAnswers[7][1],
                answer3: testAnswers[7][14],
                correctanswer: correctAnswers[7][0]
            },
            question2: {
                question: testQuestions[7][1],
                answer1: testAnswers[7][13],
                answer2: testAnswers[7][12],
                answer3: testAnswers[7][11],
                correctanswer: correctAnswers[7][1]
            },
            question3: {
                question: testQuestions[7][2],
                answer1: testAnswers[7][10],
                answer2: testAnswers[7][9],
                answer3: testAnswers[7][8],
                correctanswer: correctAnswers[7][2]
            },
            question4: {
                question: testQuestions[7][3],
                answer1: testAnswers[7][7],
                answer2: testAnswers[7][6],
                answer3: testAnswers[7][5],
                correctanswer: correctAnswers[7][3]
            },
            question5: {
                question: testQuestions[7][4],
                answer1: testAnswers[7][4],
                answer2: testAnswers[7][3],
                answer3: testAnswers[7][2],
                correctanswer: correctAnswers[7][4]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[7][0],
                answer1: entestAnswers[7][0],
                answer2: entestAnswers[7][1],
                answer3: entestAnswers[7][14],
                correctanswer: encorrectAnswers[7][0]
            },
            question2: {
                question: entestQuestions[7][1],
                answer1: entestAnswers[7][13],
                answer2: entestAnswers[7][12],
                answer3: entestAnswers[7][11],
                correctanswer: encorrectAnswers[7][1]
            },
            question3: {
                question: entestQuestions[7][2],
                answer1: entestAnswers[7][10],
                answer2: entestAnswers[7][9],
                answer3: entestAnswers[7][8],
                correctanswer: encorrectAnswers[7][2]
            },
            question4: {
                question: entestQuestions[7][3],
                answer1: entestAnswers[7][7],
                answer2: entestAnswers[7][6],
                answer3: entestAnswers[7][5],
                correctanswer: encorrectAnswers[7][3]
            },
            question5: {
                question: entestQuestions[7][4],
                answer1: entestAnswers[7][4],
                answer2: entestAnswers[7][3],
                answer3: entestAnswers[7][2],
                correctanswer: encorrectAnswers[7][4]
            }
          } },
        { id: 7, name: sectionNames[8], nameEng: engSectionNames[8], page: 9, contents: {
            ru: rusTheoryFromSect[8],
            eng: engTheoryFromSect[8]
          }, videoUrls: { ru: rusVideoFromSect[8][0], eng: rusVideoFromSect[8][1] }, test: {
            question1: {
                question: testQuestions[8][0],
                answer1: testAnswers[8][0],
                answer2: testAnswers[8][1],
                answer3: testAnswers[8][2],
                correctanswer: correctAnswers[8][0]
            },
            question2: {
                question: testQuestions[8][1],
                answer1: testAnswers[8][15],
                answer2: testAnswers[8][14],
                answer3: testAnswers[8][13],
                correctanswer: correctAnswers[8][1]
            },
            question3: {
                question: testQuestions[8][2],
                answer1: testAnswers[8][12],
                answer2: testAnswers[8][11],
                answer3: testAnswers[8][10],
                correctanswer: correctAnswers[8][2]
            },
            question4: {
                question: testQuestions[8][3],
                answer1: testAnswers[8][9],
                answer2: testAnswers[8][8],
                answer3: testAnswers[8][7],
                answer4: testAnswers[8][6],
                correctanswer: correctAnswers[8][3]
            },
            question5: {
                question: testQuestions[8][4],
                answer1: testAnswers[8][5],
                answer2: testAnswers[8][4],
                answer3: testAnswers[8][3],
                correctanswer: correctAnswers[8][4]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[8][0],
                answer1: entestAnswers[8][0],
                answer2: entestAnswers[8][1],
                answer3: entestAnswers[8][2],
                correctanswer: encorrectAnswers[8][0]
            },
            question2: {
                question: entestQuestions[8][1],
                answer1: entestAnswers[8][15],
                answer2: entestAnswers[8][14],
                answer3: entestAnswers[8][13],
                correctanswer: encorrectAnswers[8][1]
            },
            question3: {
                question: entestQuestions[8][2],
                answer1: entestAnswers[8][12],
                answer2: entestAnswers[8][11],
                answer3: entestAnswers[8][10],
                correctanswer: encorrectAnswers[8][2]
            },
            question4: {
                question: entestQuestions[8][3],
                answer1: entestAnswers[8][9],
                answer2: entestAnswers[8][8],
                answer3: entestAnswers[8][7],
                answer4: entestAnswers[8][6],
                correctanswer: encorrectAnswers[8][3]
            },
            question5: {
                question: entestQuestions[8][4],
                answer1: entestAnswers[8][5],
                answer2: entestAnswers[8][4],
                answer3: entestAnswers[8][3],
                correctanswer: encorrectAnswers[8][4]
            }
          } }
      ]
    },
    { 
      id: 3, 
      name: 'Третий раздел', 
      nameEng: 'Third section',
      topics: [
        { id: 1, name: sectionNames[9], nameEng: engSectionNames[9], page: 10, contents: {
            ru: rusTheoryFromSect[9],
            eng: engTheoryFromSect[9]
          }, videoUrls: { ru: rusVideoFromSect[9][0], eng: rusVideoFromSect[9][1] }, test: {
            question1: {
                question: testQuestions[9][0],
                answer1: testAnswers[9][0],
                answer2: testAnswers[9][13],
                answer3: testAnswers[9][12],
                correctanswer: correctAnswers[9][0]
            },
            question2: {
                question: testQuestions[9][1],
                answer1: testAnswers[9][11],
                answer2: testAnswers[9][10],
                answer3: testAnswers[9][9],
                correctanswer: correctAnswers[9][1]
            },
            question3: {
                question: testQuestions[9][2],
                answer1: testAnswers[9][8],
                answer2: testAnswers[9][7],
                answer3: testAnswers[9][6],
                correctanswer: correctAnswers[9][2]
            },
            question4: {
                question: testQuestions[9][3],
                answer1: testAnswers[9][5],
                answer2: testAnswers[9][4],
                correctanswer: correctAnswers[9][3]
            },
            question5: {
                question: testQuestions[9][4],
                answer1: testAnswers[9][3],
                answer2: testAnswers[9][2],
                answer3: testAnswers[9][1],
                correctanswer: correctAnswers[9][4]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[9][0],
                answer1: entestAnswers[9][0],
                answer2: entestAnswers[9][13],
                answer3: entestAnswers[9][12],
                correctanswer: encorrectAnswers[9][0]
            },
            question2: {
                question: entestQuestions[9][1],
                answer1: entestAnswers[9][11],
                answer2: entestAnswers[9][10],
                answer3: entestAnswers[9][9],
                correctanswer: encorrectAnswers[9][1]
            },
            question3: {
                question: entestQuestions[9][2],
                answer1: entestAnswers[9][8],
                answer2: entestAnswers[9][7],
                answer3: entestAnswers[9][6],
                correctanswer: encorrectAnswers[9][2]
            },
            question4: {
                question: entestQuestions[9][3],
                answer1: entestAnswers[9][5],
                answer2: entestAnswers[9][4],
                correctanswer: encorrectAnswers[9][3]
            },
            question5: {
                question: entestQuestions[9][4],
                answer1: entestAnswers[9][3],
                answer2: entestAnswers[9][2],
                answer3: entestAnswers[9][1],
                correctanswer: encorrectAnswers[9][4]
            }
          } },
        { id: 2, name: sectionNames[10], nameEng: engSectionNames[10], page: 11, contents: {
            ru: rusTheoryFromSect[10],
            eng: engTheoryFromSect[10]
          }, videoUrls: { ru: rusVideoFromSect[10][0], eng: rusVideoFromSect[10][1] }, test: {
            question1: {
                question: testQuestions[10][0],
                answer1: testAnswers[10][0],
                answer2: testAnswers[10][13],
                answer3: testAnswers[10][12],
                correctanswer: correctAnswers[10][0]
            },
            question2: {
                question: testQuestions[10][1],
                answer1: testAnswers[10][11],
                answer2: testAnswers[10][10],
                answer3: testAnswers[10][9],
                correctanswer: correctAnswers[10][1]
            },
            question3: {
                question: testQuestions[10][2],
                answer1: testAnswers[10][8],
                answer2: testAnswers[10][7],
                correctanswer: correctAnswers[10][2]
            },
            question4: {
                question: testQuestions[10][3],
                answer1: testAnswers[10][6],
                answer2: testAnswers[10][5],
                answer3: testAnswers[10][4],
                correctanswer: correctAnswers[10][3]
            },
            question5: {
                question: testQuestions[10][4],
                answer1: testAnswers[10][3],
                answer2: testAnswers[10][2],
                answer3: testAnswers[10][1],
                correctanswer: correctAnswers[10][4]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[10][0],
                answer1: entestAnswers[10][0],
                answer2: entestAnswers[10][13],
                answer3: entestAnswers[10][12],
                correctanswer: encorrectAnswers[10][0]
            },
            question2: {
                question: entestQuestions[10][1],
                answer1: entestAnswers[10][11],
                answer2: entestAnswers[10][10],
                answer3: entestAnswers[10][9],
                correctanswer: encorrectAnswers[10][1]
            },
            question3: {
                question: entestQuestions[10][2],
                answer1: entestAnswers[10][8],
                answer2: entestAnswers[10][7],
                correctanswer: encorrectAnswers[10][2]
            },
            question4: {
                question: entestQuestions[10][3],
                answer1: entestAnswers[10][6],
                answer2: entestAnswers[10][5],
                answer3: entestAnswers[10][4],
                correctanswer: encorrectAnswers[10][3]
            },
            question5: {
                question: entestQuestions[10][4],
                answer1: entestAnswers[10][3],
                answer2: entestAnswers[10][2],
                answer3: entestAnswers[10][1],
                correctanswer: encorrectAnswers[10][4]
            }
          } },
        { id: 3, name: sectionNames[11], nameEng: engSectionNames[11], page: 12, contents: {
            ru: rusTheoryFromSect[11],
            eng: engTheoryFromSect[11]
          }, videoUrls: { ru: rusVideoFromSect[11][0], eng: rusVideoFromSect[11][1] }, test: {
            question1: {
                question: testQuestions[11][0],
                answer1: testAnswers[11][0],
                answer2: testAnswers[11][1],
                answer3: testAnswers[11][2],
                correctanswer: correctAnswers[11][0]
            },
            question2: {
                question: testQuestions[11][1],
                answer1: testAnswers[11][3],
                answer2: testAnswers[11][4],
                answer3: testAnswers[11][17],
                correctanswer: correctAnswers[11][1]
            },
            question3: {
                question: testQuestions[11][2],
                answer1: testAnswers[11][16],
                answer2: testAnswers[11][15],
                answer3: testAnswers[11][14],
                correctanswer: correctAnswers[11][2]
            },
            question4: {
                question: testQuestions[11][3],
                answer1: testAnswers[11][13],
                answer2: testAnswers[11][12],
                answer3: testAnswers[11][11],
                correctanswer: correctAnswers[11][3]
            },
            question5: {
                question: testQuestions[11][4],
                answer1: testAnswers[11][10],
                answer2: testAnswers[11][9],
                answer3: testAnswers[11][8],
                correctanswer: correctAnswers[11][4]
            },
            question6: {
                question: testQuestions[11][5],
                answer1: testAnswers[11][7],
                answer2: testAnswers[11][6],
                answer3: testAnswers[11][5],
                correctanswer: correctAnswers[11][5]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[11][0],
                answer1: entestAnswers[11][0],
                answer2: entestAnswers[11][1],
                answer3: entestAnswers[11][2],
                correctanswer: encorrectAnswers[11][0]
            },
            question2: {
                question: entestQuestions[11][1],
                answer1: entestAnswers[11][3],
                answer2: entestAnswers[11][4],
                answer3: entestAnswers[11][17],
                correctanswer: encorrectAnswers[11][1]
            },
            question3: {
                question: entestQuestions[11][2],
                answer1: entestAnswers[11][16],
                answer2: entestAnswers[11][15],
                answer3: entestAnswers[11][14],
                correctanswer: encorrectAnswers[11][2]
            },
            question4: {
                question: entestQuestions[11][3],
                answer1: entestAnswers[11][13],
                answer2: entestAnswers[11][12],
                answer3: entestAnswers[11][11],
                correctanswer: encorrectAnswers[11][3]
            },
            question5: {
                question: entestQuestions[11][4],
                answer1: entestAnswers[11][10],
                answer2: entestAnswers[11][9],
                answer3: entestAnswers[11][8],
                correctanswer: encorrectAnswers[11][4]
            },
            question6: {
                question: entestQuestions[11][5],
                answer1: entestAnswers[11][7],
                answer2: entestAnswers[11][6],
                answer3: entestAnswers[11][5],
                correctanswer: encorrectAnswers[11][5]
            }
          } }
      ]
    },
    { 
      id: 4, 
      name: 'Четвёртый раздел', 
      nameEng: 'Fourth section',
      topics: [
        { id: 1, name: sectionNames[12], nameEng: engSectionNames[12], page: 13, contents: {
            ru: rusTheoryFromSect[12],
            eng: engTheoryFromSect[12]
          }, videoUrls: { ru: rusVideoFromSect[12][0], eng: rusVideoFromSect[12][1] }, test: {
            question1: {
                question: testQuestions[12][0],
                answer1: testAnswers[12][0],
                answer2: testAnswers[12][1],
                answer3: testAnswers[12][14],
                correctanswer: correctAnswers[12][0]
            },
            question2: {
                question: testQuestions[12][1],
                answer1: testAnswers[12][13],
                answer2: testAnswers[12][12],
                answer3: testAnswers[12][11],
                correctanswer: correctAnswers[12][1]
            },
            question3: {
                question: testQuestions[12][2],
                answer1: testAnswers[12][10],
                answer2: testAnswers[12][9],
                answer3: testAnswers[12][8],
                correctanswer: correctAnswers[12][2]
            },
            question4: {
                question: testQuestions[12][3],
                answer1: testAnswers[12][7],
                answer2: testAnswers[12][6],
                answer3: testAnswers[12][5],
                correctanswer: correctAnswers[12][3]
            },
            question5: {
                question: testQuestions[12][4],
                answer1: testAnswers[12][4],
                answer2: testAnswers[12][3],
                answer3: testAnswers[12][2],
                correctanswer: correctAnswers[12][4]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[12][0],
                answer1: entestAnswers[12][0],
                answer2: entestAnswers[12][1],
                answer3: entestAnswers[12][14],
                correctanswer: encorrectAnswers[12][0]
            },
            question2: {
                question: entestQuestions[12][1],
                answer1: entestAnswers[12][13],
                answer2: entestAnswers[12][12],
                answer3: entestAnswers[12][11],
                correctanswer: encorrectAnswers[12][1]
            },
            question3: {
                question: entestQuestions[12][2],
                answer1: entestAnswers[12][10],
                answer2: entestAnswers[12][9],
                answer3: entestAnswers[12][8],
                correctanswer: encorrectAnswers[12][2]
            },
            question4: {
                question: entestQuestions[12][3],
                answer1: entestAnswers[12][7],
                answer2: entestAnswers[12][6],
                answer3: entestAnswers[12][5],
                correctanswer: encorrectAnswers[12][3]
            },
            question5: {
                question: entestQuestions[12][4],
                answer1: entestAnswers[12][4],
                answer2: entestAnswers[12][3],
                answer3: entestAnswers[12][2],
                correctanswer: encorrectAnswers[12][4]
            }
          } },
        { id: 2, name: sectionNames[13], nameEng: engSectionNames[13], page: 14, contents: {
            ru: rusTheoryFromSect[13],
            eng: engTheoryFromSect[13]
          }, videoUrls: { ru: rusVideoFromSect[13][0], eng: rusVideoFromSect[13][1] }, test: {
            question1: {
                question: testQuestions[13][0],
                answer1: testAnswers[13][0],
                answer2: testAnswers[13][1],
                answer3: testAnswers[13][14],
                correctanswer: correctAnswers[13][0]
            },
            question2: {
                question: testQuestions[13][1],
                answer1: testAnswers[13][13],
                answer2: testAnswers[13][12],
                answer3: testAnswers[13][11],
                correctanswer: correctAnswers[13][1]
            },
            question3: {
                question: testQuestions[13][2],
                answer1: testAnswers[13][10],
                answer2: testAnswers[13][9],
                answer3: testAnswers[13][8],
                correctanswer: correctAnswers[13][2]
            },
            question4: {
                question: testQuestions[13][3],
                answer1: testAnswers[13][7],
                answer2: testAnswers[13][6],
                answer3: testAnswers[13][5],
                correctanswer: correctAnswers[13][3]
            },
            question5: {
                question: testQuestions[13][4],
                answer1: testAnswers[13][4],
                answer2: testAnswers[13][3],
                answer3: testAnswers[13][2],
                correctanswer: correctAnswers[13][4]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[13][0],
                answer1: entestAnswers[13][0],
                answer2: entestAnswers[13][1],
                answer3: entestAnswers[13][14],
                correctanswer: encorrectAnswers[13][0]
            },
            question2: {
                question: entestQuestions[13][1],
                answer1: entestAnswers[13][13],
                answer2: entestAnswers[13][12],
                answer3: entestAnswers[13][11],
                correctanswer: encorrectAnswers[13][1]
            },
            question3: {
                question: entestQuestions[13][2],
                answer1: entestAnswers[13][10],
                answer2: entestAnswers[13][9],
                answer3: entestAnswers[13][8],
                correctanswer: correctAnswers[13][2]
            },
            question4: {
                question: entestQuestions[13][3],
                answer1: entestAnswers[13][7],
                answer2: entestAnswers[13][6],
                answer3: entestAnswers[13][5],
                correctanswer: encorrectAnswers[13][3]
            },
            question5: {
                question: entestQuestions[13][4],
                answer1: entestAnswers[13][4],
                answer2: entestAnswers[13][3],
                answer3: entestAnswers[13][2],
                correctanswer: encorrectAnswers[13][4]
            }
          } }
      ]
    },
    { 
      id: 5, 
      name: 'Пятый раздел', 
      nameEng: 'Fifth section',
      topics: [
        { id: 1, name: sectionNames[14], nameEng: engSectionNames[14], page: 15, contents: {
            ru: rusTheoryFromSect[14],
            eng: engTheoryFromSect[14]
          }, videoUrls: { ru: rusVideoFromSect[14][0], eng: rusVideoFromSect[14][1] }, test: {
            question1: {
                question: testQuestions[14][0],
                answer1: testAnswers[14][0],
                answer2: testAnswers[14][1],
                answer3: testAnswers[14][14],
                correctanswer: correctAnswers[14][0]
            },
            question2: {
                question: testQuestions[14][1],
                answer1: testAnswers[14][13],
                answer2: testAnswers[14][12],
                answer3: testAnswers[14][11],
                correctanswer: correctAnswers[14][1]
            },
            question3: {
                question: testQuestions[14][2],
                answer1: testAnswers[14][10],
                answer2: testAnswers[14][9],
                answer3: testAnswers[14][8],
                correctanswer: correctAnswers[14][2]
            },
            question4: {
                question: testQuestions[14][3],
                answer1: testAnswers[14][7],
                answer2: testAnswers[14][6],
                answer3: testAnswers[14][5],
                correctanswer: correctAnswers[14][3]
            },
            question5: {
                question: testQuestions[14][4],
                answer1: testAnswers[14][4],
                answer2: testAnswers[14][3],
                answer3: testAnswers[14][2],
                correctanswer: correctAnswers[14][4]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[14][0],
                answer1: entestAnswers[14][0],
                answer2: entestAnswers[14][1],
                answer3: entestAnswers[14][14],
                correctanswer: encorrectAnswers[14][0]
            },
            question2: {
                question: entestQuestions[14][1],
                answer1: entestAnswers[14][13],
                answer2: entestAnswers[14][12],
                answer3: entestAnswers[14][11],
                correctanswer: encorrectAnswers[14][1]
            },
            question3: {
                question: entestQuestions[14][2],
                answer1: entestAnswers[14][10],
                answer2: entestAnswers[14][9],
                answer3: entestAnswers[14][8],
                correctanswer: encorrectAnswers[14][2]
            },
            question4: {
                question: entestQuestions[14][3],
                answer1: entestAnswers[14][7],
                answer2: entestAnswers[14][6],
                answer3: entestAnswers[14][5],
                correctanswer: encorrectAnswers[14][3]
            },
            question5: {
                question: entestQuestions[14][4],
                answer1: entestAnswers[14][4],
                answer2: entestAnswers[14][3],
                answer3: entestAnswers[14][2],
                correctanswer: encorrectAnswers[14][4]
            }
          } },
        { id: 2, name: sectionNames[15], nameEng: engSectionNames[15], page: 16, contents: {
            ru: rusTheoryFromSect[15],
            eng: engTheoryFromSect[15]
          }, videoUrls: { ru: rusVideoFromSect[15][0], eng: rusVideoFromSect[15][1] }, test: {
            question1: {
                question: testQuestions[15][0],
                answer1: testAnswers[15][0],
                answer2: testAnswers[15][1],
                answer3: testAnswers[15][14],
                correctanswer: correctAnswers[15][0]
            },
            question2: {
                question: testQuestions[15][1],
                answer1: testAnswers[15][13],
                answer2: testAnswers[15][12],
                answer3: testAnswers[15][11],
                correctanswer: correctAnswers[15][1]
            },
            question3: {
                question: testQuestions[15][2],
                answer1: testAnswers[15][10],
                answer2: testAnswers[15][9],
                answer3: testAnswers[15][8],
                correctanswer: correctAnswers[15][2]
            },
            question4: {
                question: testQuestions[15][3],
                answer1: testAnswers[15][7],
                answer2: testAnswers[15][6],
                answer3: testAnswers[15][5],
                correctanswer: correctAnswers[15][3]
            },
            question5: {
                question: testQuestions[15][4],
                answer1: testAnswers[15][4],
                answer2: testAnswers[15][3],
                answer3: testAnswers[15][2],
                correctanswer: correctAnswers[15][4]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[15][0],
                answer1: entestAnswers[15][0],
                answer2: entestAnswers[15][1],
                answer3: entestAnswers[15][14],
                correctanswer: encorrectAnswers[15][0]
            },
            question2: {
                question: entestQuestions[15][1],
                answer1: entestAnswers[15][13],
                answer2: entestAnswers[15][12],
                answer3: entestAnswers[15][11],
                correctanswer: encorrectAnswers[15][1]
            },
            question3: {
                question: entestQuestions[15][2],
                answer1: entestAnswers[15][10],
                answer2: entestAnswers[15][9],
                answer3: entestAnswers[15][8],
                correctanswer: encorrectAnswers[15][2]
            },
            question4: {
                question: entestQuestions[15][3],
                answer1: entestAnswers[15][7],
                answer2: entestAnswers[15][6],
                answer3: entestAnswers[15][5],
                correctanswer: encorrectAnswers[15][3]
            },
            question5: {
                question: entestQuestions[15][4],
                answer1: entestAnswers[15][4],
                answer2: entestAnswers[15][3],
                answer3: entestAnswers[15][2],
                correctanswer: encorrectAnswers[15][4]
            }
          } },
        { id: 3, name: sectionNames[16], nameEng: engSectionNames[16], page: 17, contents: {
            ru: rusTheoryFromSect[16],
            eng: engTheoryFromSect[16]
          }, videoUrls: { ru: rusVideoFromSect[16][0], eng: rusVideoFromSect[16][1] }, test: {
            question1: {
                question: testQuestions[16][0],
                answer1: testAnswers[16][0],
                answer2: testAnswers[16][1],
                correctanswer: correctAnswers[16][0]
            },
            question2: {
                question: testQuestions[16][1],
                answer1: testAnswers[16][2],
                answer2: testAnswers[16][3],
                correctanswer: correctAnswers[16][1]
            },
            question3: {
                question: testQuestions[16][2],
                answer1: testAnswers[16][4],
                answer2: testAnswers[16][5],
                answer3: testAnswers[16][6],
                correctanswer: correctAnswers[16][2]
            },
            question4: {
                question: testQuestions[16][3],
                answer1: testAnswers[16][7],
                answer2: testAnswers[16][8],
                answer3: testAnswers[16][9],
                correctanswer: correctAnswers[16][3]
            },
            question5: {
                question: testQuestions[16][4],
                answer1: testAnswers[16][10],
                answer2: testAnswers[16][11],
                answer3: testAnswers[16][12],
                correctanswer: correctAnswers[16][4]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[16][0],
                answer1: entestAnswers[16][0],
                answer2: entestAnswers[16][1],
                correctanswer: encorrectAnswers[16][0]
            },
            question2: {
                question: entestQuestions[16][1],
                answer1: entestAnswers[16][2],
                answer2: entestAnswers[16][3],
                correctanswer: encorrectAnswers[16][1]
            },
            question3: {
                question: entestQuestions[16][2],
                answer1: entestAnswers[16][4],
                answer2: entestAnswers[16][5],
                answer3: entestAnswers[16][6],
                correctanswer: encorrectAnswers[16][2]
            },
            question4: {
                question: entestQuestions[16][3],
                answer1: entestAnswers[16][7],
                answer2: entestAnswers[16][8],
                answer3: entestAnswers[16][9],
                correctanswer: encorrectAnswers[16][3]
            },
            question5: {
                question: entestQuestions[16][4],
                answer1: entestAnswers[16][10],
                answer2: entestAnswers[16][11],
                answer3: entestAnswers[16][12],
                correctanswer: encorrectAnswers[16][4]
            }
          } }
      ]
    },
    { 
      id: 6, 
      name: 'Шестой раздел', 
      nameEng: 'Sixth section',
      topics: [
        { id: 1, name: sectionNames[17], nameEng: engSectionNames[17], page: 18, contents: {
            ru: rusTheoryFromSect[17],
            eng: engTheoryFromSect[17]
          }, videoUrls: { ru: rusVideoFromSect[17][0], eng: rusVideoFromSect[17][1] }, test: {
            question1: {
                question: testQuestions[17][0],
                answer1: testAnswers[17][0],
                answer2: testAnswers[17][1],
                answer3: testAnswers[17][2],
                correctanswer: correctAnswers[17][0]
            },
            question2: {
                question: testQuestions[17][1],
                answer1: testAnswers[17][3],
                answer2: testAnswers[17][4],
                answer3: testAnswers[17][5],
                correctanswer: correctAnswers[17][1]
            },
            question3: {
                question: testQuestions[17][2],
                answer1: testAnswers[17][6],
                answer2: testAnswers[17][7],
                answer3: testAnswers[17][8],
                correctanswer: correctAnswers[17][2]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[17][0],
                answer1: entestAnswers[17][0],
                answer2: entestAnswers[17][1],
                answer3: entestAnswers[17][2],
                correctanswer: encorrectAnswers[17][0]
            },
            question2: {
                question: entestQuestions[17][1],
                answer1: entestAnswers[17][3],
                answer2: entestAnswers[17][4],
                answer3: entestAnswers[17][5],
                correctanswer: encorrectAnswers[17][1]
            },
            question3: {
                question: entestQuestions[17][2],
                answer1: entestAnswers[17][6],
                answer2: entestAnswers[17][7],
                answer3: entestAnswers[17][8],
                correctanswer: encorrectAnswers[17][2]
            }
          } },
        { id: 2, name: sectionNames[18], nameEng: engSectionNames[18], page: 19, contents: {
            ru: rusTheoryFromSect[18],
            eng: engTheoryFromSect[18]
          }, videoUrls: { ru: rusVideoFromSect[18][0], eng: rusVideoFromSect[18][1] }, test: {
            question1: {
                question: testQuestions[18][0],
                answer1: testAnswers[18][0],
                answer2: testAnswers[18][13],
                correctanswer: correctAnswers[18][0]
            },
            question2: {
                question: testQuestions[18][1],
                answer1: testAnswers[18][12],
                answer2: testAnswers[18][11],
                answer3: testAnswers[18][10],
                correctanswer: correctAnswers[18][1]
            },
            question3: {
                question: testQuestions[18][2],
                answer1: testAnswers[18][9],
                answer2: testAnswers[18][8],
                answer3: testAnswers[18][7],
                correctanswer: correctAnswers[18][2]
            },
            question4: {
                question: testQuestions[18][3],
                answer1: testAnswers[18][6],
                answer2: testAnswers[18][5],
                answer3: testAnswers[18][4],
                correctanswer: correctAnswers[18][3]
            },
            question5: {
                question: testQuestions[18][4],
                answer1: testAnswers[18][3],
                answer2: testAnswers[18][2],
                answer3: testAnswers[18][1],
                correctanswer: correctAnswers[18][4]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[18][0],
                answer1: entestAnswers[18][0],
                answer2: entestAnswers[18][13],
                correctanswer: encorrectAnswers[18][0]
            },
            question2: {
                question: entestQuestions[18][1],
                answer1: entestAnswers[18][12],
                answer2: entestAnswers[18][11],
                answer3: entestAnswers[18][10],
                correctanswer: encorrectAnswers[18][1]
            },
            question3: {
                question: entestQuestions[18][2],
                answer1: entestAnswers[18][9],
                answer2: entestAnswers[18][8],
                answer3: entestAnswers[18][7],
                correctanswer: encorrectAnswers[18][2]
            },
            question4: {
                question: entestQuestions[18][3],
                answer1: entestAnswers[18][6],
                answer2: entestAnswers[18][5],
                answer3: entestAnswers[18][4],
                correctanswer: encorrectAnswers[18][3]
            },
            question5: {
                question: entestQuestions[18][4],
                answer1: entestAnswers[18][3],
                answer2: entestAnswers[18][2],
                answer3: entestAnswers[18][1],
                correctanswer: encorrectAnswers[18][4]
            }
          } },
        { id: 3, name: sectionNames[19], nameEng: engSectionNames[19], page: 20, contents: {
            ru: rusTheoryFromSect[19],
            eng: engTheoryFromSect[19]
          }, videoUrls: { ru: rusVideoFromSect[19][0], eng: rusVideoFromSect[19][1] }, test: {
            question1: {
                question: testQuestions[19][0],
                answer1: testAnswers[19][0],
                answer2: testAnswers[19][1],
                answer3: testAnswers[19][14],
                correctanswer: correctAnswers[19][0]
            },
            question2: {
                question: testQuestions[19][1],
                answer1: testAnswers[19][13],
                answer2: testAnswers[19][12],
                answer3: testAnswers[19][11],
                correctanswer: correctAnswers[19][1]
            },
            question3: {
                question: testQuestions[19][2],
                answer1: testAnswers[19][10],
                answer2: testAnswers[19][9],
                answer3: testAnswers[19][8],
                correctanswer: correctAnswers[19][2]
            },
            question4: {
                question: testQuestions[19][3],
                answer1: testAnswers[19][7],
                answer2: testAnswers[19][6],
                answer3: testAnswers[19][5],
                correctanswer: correctAnswers[19][3]
            },
            question5: {
                question: testQuestions[19][4],
                answer1: testAnswers[19][4],
                answer2: testAnswers[19][3],
                answer3: testAnswers[19][2],
                correctanswer: correctAnswers[19][4]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[19][0],
                answer1: entestAnswers[19][0],
                answer2: entestAnswers[19][1],
                answer3: entestAnswers[19][14],
                correctanswer: encorrectAnswers[19][0]
            },
            question2: {
                question: entestQuestions[19][1],
                answer1: entestAnswers[19][13],
                answer2: entestAnswers[19][12],
                answer3: entestAnswers[19][11],
                correctanswer: encorrectAnswers[19][1]
            },
            question3: {
                question: entestQuestions[19][2],
                answer1: entestAnswers[19][10],
                answer2: entestAnswers[19][9],
                answer3: entestAnswers[19][8],
                correctanswer: encorrectAnswers[19][2]
            },
            question4: {
                question: entestQuestions[19][3],
                answer1: entestAnswers[19][7],
                answer2: entestAnswers[19][6],
                answer3: entestAnswers[19][5],
                correctanswer: encorrectAnswers[19][3]
            },
            question5: {
                question: entestQuestions[19][4],
                answer1: entestAnswers[19][4],
                answer2: entestAnswers[19][3],
                answer3: entestAnswers[19][2],
                correctanswer: encorrectAnswers[19][4]
            }
          } },
        { id: 4, name: sectionNames[20], nameEng: engSectionNames[20], page: 21, contents: {
            ru: rusTheoryFromSect[20],
            eng: engTheoryFromSect[20]
          }, videoUrls: { ru: rusVideoFromSect[20][0], eng: rusVideoFromSect[20][1] }, test: {
            question1: {
                question: testQuestions[20][0],
                answer1: testAnswers[20][0],
                answer2: testAnswers[20][1],
                answer3: testAnswers[20][2],
                correctanswer: correctAnswers[20][0]
            },
            question2: {
                question: testQuestions[20][1],
                answer1: testAnswers[20][3],
                answer2: testAnswers[20][4],
                answer3: testAnswers[20][5],
                correctanswer: correctAnswers[20][1]
            },
            question3: {
                question: testQuestions[20][2],
                answer1: testAnswers[20][6],
                answer2: testAnswers[20][7],
                answer3: testAnswers[20][8],
                correctanswer: correctAnswers[20][2]
            },
            question4: {
                question: testQuestions[20][3],
                answer1: testAnswers[20][9],
                answer2: testAnswers[20][10],
                answer3: testAnswers[20][11],
                correctanswer: correctAnswers[20][3]
            }
          }, en_test: {
            question1: {
                question: entestQuestions[20][0],
                answer1: entestAnswers[20][0],
                answer2: entestAnswers[20][1],
                answer3: entestAnswers[20][2],
                correctanswer: encorrectAnswers[20][0]
            },
            question2: {
                question: entestQuestions[20][1],
                answer1: entestAnswers[20][3],
                answer2: entestAnswers[20][4],
                answer3: entestAnswers[20][5],
                correctanswer: encorrectAnswers[20][1]
            },
            question3: {
                question: entestQuestions[20][2],
                answer1: entestAnswers[20][6],
                answer2: entestAnswers[20][7],
                answer3: entestAnswers[20][8],
                correctanswer: encorrectAnswers[20][2]
            },
            question4: {
                question: entestQuestions[20][3],
                answer1: entestAnswers[20][9],
                answer2: entestAnswers[20][10],
                answer3: entestAnswers[20][11],
                correctanswer: encorrectAnswers[20][3]
            }
          } }
      ]
    }
  ];

  // Навигация
  const goToSections = () => {
    setSelectedSection(null);
    setSelectedTopic(null);
    setCurrentScreen('sections');
  };

  const goToTopics = (sectionId: number) => {
    setSelectedSection(sectionId);
    setCurrentScreen('topics');
  };

  const goToContent = (topicId: number, page: number) => {
    setSelectedTopic(topicId);
    setCurrentPage(page);
    setCurrentScreen('content');
  };

  const goToTest = (topicId: number) => {
    setSelectedTopic(topicId);
    setCurrentScreen('test');
    setUserAnswers({});
    setTestResult(null);
  };

  const goToVideo = (topicId: number) => {
    setSelectedTopic(topicId);
    setCurrentScreen('video');
  };

  const extractSectionTitle = (html: string) => {
    const lines = html.split('\n');
    
    const cleanText = (line: string) => {
      return line
        .replace(/<[^>]*>/g, ' ') // Удаляем HTML-теги
        .replace(/@page\s*{[^}]*}/g, '') // Удаляем @page правила
        .replace(/\.[a-zA-Z\-]+\s*{[^}]*}/g, '') // Удаляем классы CSS
        .replace(/[a-zA-Z\-]+:\s*[^;]+;/g, '') // Удаляем CSS свойства
        .replace(/\s+/g, ' ') // Удаляем лишние пробелы
        .trim();
    };

    const lineChecks = [
      [19, 20], [18, 19], [22, 23], 
      [23, 24], [27, 28], [32, 33], 
      [36, 37]
    ];

    for (const [line1, line2] of lineChecks) {
      const text1 = cleanText(lines[line1] || '');
      const text2 = cleanText(lines[line2] || '');
      const combinedText = `${text1} ${text2}`.trim();
      
      if (combinedText.length > 3 && 
          !combinedText.startsWith('@') && 
          !combinedText.match(/[{}:]/)) {
        return combinedText;
      }
    }

    const singleLines = [18, 19, 20, 22, 23, 24, 27, 28, 32, 33, 36, 37];
    for (const lineNum of singleLines) {
      const text = cleanText(lines[lineNum] || '');
      if (text.length > 3 && !text.match(/[{}:@]/)) {
        return text;
      }
    }

    return language === 'ru' ? 'Название раздела' : 'Section title';
  };

  // Загрузка контента страницы
  const loadPageContent = async (page: number, lang: 'ru' | 'eng') => {
    if (selectedSection === null || selectedTopic === null) return '';
    const current = sections.find(s => s.id === selectedSection);
    const topic = current?.topics.find(t => t.id === selectedTopic);
    const html = topic?.contents[lang] || '';
    const title = extractSectionTitle(html);
    setSectionTitle(title);
    return html;
  };
  // Загрузка контента при изменении страницы
  useEffect(() => {
    if (currentScreen === 'content' && selectedTopic !== null) {
      const loadPage = async () => {
        const html = await loadPageContent(currentPage, language);
        setRenderedHtml(html);
      };
      loadPage();
    }
  }, [currentPage, language, selectedTopic, currentScreen]);

  // Генерация URL для iframe
  const getIframeSrc = () => {
    const blob = new Blob([renderedHtml], { type: 'text/html' });
    return URL.createObjectURL(blob);
  };

  // Получение текущего раздела и темы
  const currentSection = sections.find(s => s.id === selectedSection);
  const currentTopic = currentSection?.topics.find(t => t.id === selectedTopic);

  // Рендер экрана выбора разделов
  const renderSectionSelection = () => (
    <div class="flex flex-col h-full p-5">
      <h2 class="py-1 text-2xl">{language === 'ru' ? 'Выберите раздел' : 'Select section'}</h2>
      <div class="flex flex-col flex-wrap justify-center gap-4 px-10 py-2 sm:flex-row sm:justify-start sm:px-0">
        {sections.map(section => (
          <div
            key={section.id}
            class="flex h-24 w-full items-center justify-center rounded-lg border-2 border-dashed border-[#DCDCDC] cursor-pointer hover:border-[#B8B8B8] hover:bg-[#F5F5F5] text-center text-sm font-medium transition-all sm:w-48"
            onClick={() => goToTopics(section.id)}
          >
            {language === 'ru' ? section.name : section.nameEng}
          </div>
        ))}
      </div>
    </div>
  );

  // Рендер экрана выбора тем
  const renderTopicSelection = () => {
    if (!currentSection) return goToSections();

    return (
      <div class="flex flex-col h-full p-5">
        <div class="flex justify-between items-center mb-4">
          <button 
            onClick={goToSections}
            class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            ← {language === 'ru' ? 'К разделам' : 'To sections'}
          </button>
          <h2 class="text-xl">{language === 'ru' ? currentSection.name : currentSection.nameEng}</h2>
          <div></div>
        </div>
        
        <div class="flex flex-col flex-wrap justify-center gap-4 px-10 py-2 sm:flex-row sm:justify-start sm:px-0">
          {currentSection.topics.map(topic => (
            <div
              key={topic.id}
              class="flex flex-col h-24 w-full items-center justify-center rounded-lg border-2 border-dashed border-[#DCDCDC] cursor-pointer hover:border-[#B8B8B8] hover:bg-[#F5F5F5] text-center text-sm font-medium transition-all sm:w-48"
              onClick={() => goToContent(topic.id, topic.page)}
            >
              {language === 'ru' ? topic.name : topic.nameEng}
              
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Рендер экрана с контентом
  const renderContent = () => {
    if (!currentSection || !currentTopic) return goToSections();

    return (
      <div class="flex flex-col h-full">
        {/* Панель навигации */}
        <div class="flex justify-between items-center p-2 bg-gray-100 border-b">
          <div class="flex gap-2">
            <button
              onClick={() => setCurrentScreen('topics')}
              class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              ← {language === 'ru' ? 'К темам' : 'To topics'}
            </button>
            <button
              onClick={goToSections}
              class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              {language === 'ru' ? 'К разделам' : 'To sections'}
            </button>
            <button
              onClick={() => window.location.href = '/'}
              class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              {language === 'ru' ? 'В главное меню' : 'To main menu'}
            </button>
          </div>
          
          <div class="flex gap-2">
            <button
              onClick={() => setLanguage('ru')}
              class={`px-3 py-1 rounded ${language === 'ru' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Русский
            </button>
            <button
              onClick={() => setLanguage('eng')}
              class={`px-3 py-1 rounded ${language === 'eng' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              English
            </button>
          </div>
        </div>

        {/* Информация о текущей теме */}
        <div class="flex justify-between items-center p-2 bg-gray-50 border-b">
          <div class="text-sm font-medium">
            {language === 'ru' ? 'Тема' : 'Topic'}: {language === 'ru' ? currentTopic.name : currentTopic.nameEng}
          </div>
          
          {currentTopic.videoUrls && (
            <button
              onClick={() => goToVideo(currentTopic.id)}
              class="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              {language === 'ru' ? 'Перейти к видео' : 'Go to video'}
            </button>
          )}
          <button onClick={() => goToTest(currentTopic.id)} class="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600">
            {language === 'ru' ? 'Пройти тест' : 'Take test'}
          </button>
        </div>

        {/* Контейнер с контентом */}
        {renderedHtml && (
          <iframe 
            src={getIframeSrc()}
            class="w-full flex-1 border-none"
            sandbox="allow-same-origin"
            title={`Page ${currentPage} (${language})`}
            key={`${currentPage}-${language}`}
          />
        )}
      </div>
    );
  };

  // Рендер экрана с видео
  const renderVideo = () => {
    if (!currentSection || !currentTopic) return goToSections();

    const videoUrl = currentTopic.videoUrls ? currentTopic.videoUrls[language] : null;
    const videoId = videoUrl?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1] || '';
    
    return (
      <div class="flex flex-col h-full">
        {/* Панель навигации */}
        <div class="flex justify-between items-center p-2 bg-gray-100 border-b">
          <div class="flex gap-2">
            <button
              onClick={() => setCurrentScreen('content')}
              class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              ← {language === 'ru' ? 'К теме' : 'To topic'}
            </button>
            <button
              onClick={() => setCurrentScreen('topics')}
              class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              {language === 'ru' ? 'К темам' : 'To topics'}
            </button>
            <button
              onClick={goToSections}
              class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
              {language === 'ru' ? 'К разделам' : 'To sections'}
            </button>
          </div>
          
          <div class="flex gap-2">
            <button
              onClick={() => setLanguage('ru')}
              class={`px-3 py-1 rounded ${language === 'ru' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Русский
            </button>
            <button
              onClick={() => setLanguage('eng')}
              class={`px-3 py-1 rounded ${language === 'eng' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              English
            </button>
          </div>
        </div>

        {/* Информация о текущей теме */}
        <div class="flex justify-between items-center p-2 bg-gray-50 border-b">
          <div class="text-sm font-medium">
            {language === 'ru' ? 'Видео по теме' : 'Video for topic'}: {language === 'ru' ? currentTopic.name : currentTopic.nameEng}
          </div>
        </div>

        {/* Контейнер с видео */}
        <div class="flex-1 overflow-auto p-4">
          {videoUrl ? (
            <div class="flex flex-col items-center h-full">
              <div class="w-full max-w-4xl h-full">
                <div class="relative h-0 pb-[56.25%]"> {/* 16:9 Aspect Ratio */}
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    class="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={language === 'ru' ? 'Видео по теме' : 'Topic video'}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div class="flex items-center justify-center h-full">
              <p class="text-gray-500">
                {language === 'ru' ? 'Для этой темы нет видео' : 'No videos available for this topic'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTest = () => {
    if (selectedSection == null || selectedTopic == null) return goToSections();
    const topic = sections.find(s => s.id === selectedSection)!.topics.find(t => t.id === selectedTopic)!;
    const testObj = language === 'ru' ? topic.test : topic.en_test;
    const keys = Object.keys(testObj);

    const handleSubmit = () => {
      let score = 0;
      keys.forEach(k => {
        if (userAnswers[k] === testObj[k].correctanswer) score++;
      });
      const msg = language === 'ru'
        ? `Вы ответили правильно на ${score} из ${keys.length} вопросов`
        : `You answered correctly ${score} out of ${keys.length} questions`;
      setModalMessage(msg);
      setIsModalOpen(true);
    };

    return (
      <div class="relative flex flex-col h-full p-5">
        {/* Навигация */}
        <div class="flex justify-between items-center mb-4">
          <button onClick={() => setCurrentScreen('content')} class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">← {language==='ru' ? 'К теме' : 'To topic'}</button>
          <h2 class="text-xl">{language==='ru' ? 'Тест:' : 'Test:'} {language==='ru' ? topic.name : topic.nameEng}</h2>
          <div />
        </div>

        {/* Вопросы */}
        <div class="flex-1 overflow-auto">
          {keys.map((qKey, idx) => {
            const q = testObj[qKey];
            return (
              <div key={qKey} class="mb-6">
                <p class="font-medium mb-2">{idx+1}. {q.question}</p>
                {['answer1','answer2','answer3'].map(ansKey => q[ansKey] && (
                  <label key={ansKey} class="block mb-1">
                    <input
                      type="radio"
                      name={qKey}
                      value={q[ansKey]}
                      checked={userAnswers[qKey]===q[ansKey]}
                      onChange={() => setUserAnswers({...userAnswers, [qKey]: q[ansKey]})}
                      class="mr-2"
                    />
                    {q[ansKey]}
                  </label>
                ))}
              </div>
            );
          })}
        </div>

        {/* Кнопка отправки */}
        <div class="mt-auto">
          <button onClick={handleSubmit} class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">{language==='ru' ? 'Отправить ответы' : 'Submit'}</button>
        </div>

        {/* Модалка */}
        {isModalOpen && (
          <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div class="bg-white rounded-2xl p-6 w-80 text-center">
              <p class="mb-4 font-semibold">{modalMessage}</p>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentScreen('content');
                }}
                class="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
              >
                {language==='ru' ? 'Закрыть' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };


  // Выбор экрана для отображения
  switch (currentScreen) {
    case 'topics':
      return renderTopicSelection();
    case 'content':
      return renderContent();
    case 'video':
      return renderVideo();
    case 'test': 
      return renderTest();
    default:
      return renderSectionSelection();
  }
};
