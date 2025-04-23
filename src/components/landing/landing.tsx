import { navigation } from '../../store/slices/navigation'
import { links } from '../../store/slices/links'
import { LandingCard } from './landing-card'
import { useState } from 'preact/hooks'
import { GraphTheoryViewer } from '../theory/graph_theory_viewer'

export const Landing = () => {
  const [showGraphTheory, setShowGraphTheory] = useState(false)

  if (showGraphTheory) {
    return (
      <div class="flex h-full flex-col">
        <button 
          onClick={() => setShowGraphTheory(false)}
          class="p-2 mb-4 text-primary hover:underline"
        >
          ← Вернуться назад
        </button>
        <GraphTheoryViewer />
      </div>
    )
  }
  
  return (
    <div class='flex h-full flex-col'>
      <section class='pb-5'>
        <h2 class='py-1 text-2xl'>Теория</h2>
        <div class='flex flex-col flex-wrap justify-center gap-4 px-10 py-2 sm:flex-row sm:justify-start sm:px-0'>
          <LandingCard 
            click={() => setShowGraphTheory(true)}
          >
            Теория графов
          </LandingCard>
          <LandingCard link={links.setTheory}>Теория множеств</LandingCard>
          {/* <LandingCard lock>Карта понятий</LandingCard> */}
          {/* <LandingCard click={() => (document.querySelector('a[sc_addr="94325"]') as any)?.click()}>SCn код</LandingCard> */}
        </div>
      </section>

      {/* <section class='pb-5'>
        <h2 class='py-1 text-2xl'>Тренировочные задачи</h2>
        <div class='flex flex-col flex-wrap justify-center gap-4 px-10 py-2 sm:flex-row sm:justify-start sm:px-0'>
          <LandingCard click={() => openTask('lala')}>Ориентированность графа</LandingCard>
          <LandingCard lock>Метаграф</LandingCard>
          <LandingCard lock>Цикл графа</LandingCard>
          <LandingCard lock>Граф</LandingCard>
        </div>
      </section> */}

      <section class='pb-5'>
        <h2 class='py-1 text-2xl'>Рабочие пространства</h2>
        <div class='flex flex-col flex-wrap justify-center gap-4 px-10 py-2 sm:flex-row sm:justify-start sm:px-0'>
          {navigation.spaces.map(space => (
            <LandingCard link={space.addr} click={e => (e.stopPropagation(), navigation.openSpace(space.addr))}>
              {space.name}
            </LandingCard>
          ))}
          <LandingCard new click={() => navigation.createSpace()} />
        </div>
      </section>

      <section class='pb-5'>
        <h2 class='py-1 text-2xl'>Справка</h2>
        <div class='flex flex-col flex-wrap justify-center gap-4 px-10 py-2 sm:flex-row sm:justify-start sm:px-0'>
          <LandingCard link={links.documentationGraphTheory}>Документация</LandingCard>
        </div>
      </section>
    </div>
  )
}
