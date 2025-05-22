import { ComponentChildren } from 'preact'
// import { useEffect } from 'preact/hooks';

export const EmbeddedLayout = (props: { children: ComponentChildren; full?: true; class?: string }) => {
  // useEffect(() => {
  //   console.warn('mount?!')
  // })
  return (
    <section
      class={`absolute flex flex-col font-nunito text-base ${props.full ? 'inset-0 rounded-[4px]' : 'inset-4'} ${props.class ?? ''}`}
      onContextMenu={e => !(e.target as any)?.getAttribute('sc_addr') && e.stopPropagation()}
    >
      <style type='text/css'>{`
        #window-header-tools {
          top: -53px;
          right: 230px;
        }
        #window-header-tools {
          display: flex;
          flex-direction: row-reverse;
          gap: 0.5rem;        
        }
        #header {
          height: 52px;
        }
        .help-button {
          margin-top: 9px;
        }
        ul#context-menu {
          transform: translate(1px, -72px);
        }
      `}</style>
      {props.children}
    </section>
  )
}
