export const Link = ({ children, link }: { children: string | string[]; link?: number }) => {
  return (
    <span
      class='cursor-pointer border-b border-dashed border-transparent transition-colors duration-45 hover:border-primary hover:text-primary'
      //@ts-ignore
      sc_addr={link}
    >
      {children}
    </span>
  )
}
