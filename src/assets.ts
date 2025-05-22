// import config from '../vite.config'
export const assets = (pathname: string) =>
  import.meta.resolve(import.meta.env.DEV ? `../public/${pathname}` : `./${pathname}`)
