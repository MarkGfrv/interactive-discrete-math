declare interface Console {
  logCrimson(...args: unknown[]): void
  logDeepPink(...args: unknown[]): void
  logDarkOrange(...args: unknown[]): void
  logOrangeRed(...args: unknown[]): void
  logDarkKhaki(...args: unknown[]): void
  logViolet(...args: unknown[]): void
  logMediumOrchid(...args: unknown[]): void
  logMediumSlateBlue(...args: unknown[]): void
  logMediumSeaGreen(...args: unknown[]): void
  logLightGreen(...args: unknown[]): void
  logYellowGreen(...args: unknown[]): void
  logOlive(...args: unknown[]): void
  logMediumAquamarine(...args: unknown[]): void
  logDarkCyan(...args: unknown[]): void
  logLightSkyBlue(...args: unknown[]): void
  logDeepSkyBlue(...args: unknown[]): void
  logCornflowerBlue(...args: unknown[]): void
}

Object.defineProperties(console, {
  logCrimson: {
    value(...[label, ...args]: unknown[]) {
      console.log('%c' + (typeof label === 'object' ? JSON.stringify(label) : label), 'color:crimson', ...args)
    },
  },
  logDeepPink: {
    value(...[label, ...args]: unknown[]) {
      console.log('%c' + (typeof label === 'object' ? JSON.stringify(label) : label), 'color:deeppink', ...args)
    },
  },
  logDarkOrange: {
    value(...[label, ...args]: unknown[]) {
      console.log('%c' + (typeof label === 'object' ? JSON.stringify(label) : label), 'color:darkorange', ...args)
    },
  },
  logOrangeRed: {
    value(...[label, ...args]: unknown[]) {
      console.log('%c' + (typeof label === 'object' ? JSON.stringify(label) : label), 'color:orangered', ...args)
    },
  },
  logDarkKhaki: {
    value(...[label, ...args]: unknown[]) {
      console.log('%c' + (typeof label === 'object' ? JSON.stringify(label) : label), 'color:darkkhaki', ...args)
    },
  },
  logViolet: {
    value(...[label, ...args]: unknown[]) {
      console.log('%c' + (typeof label === 'object' ? JSON.stringify(label) : label), 'color:violet', ...args)
    },
  },
  logMediumOrchid: {
    value(...[label, ...args]: unknown[]) {
      console.log('%c' + (typeof label === 'object' ? JSON.stringify(label) : label), 'color:mediumorchid', ...args)
    },
  },
  logMediumSlateBlue: {
    value(...[label, ...args]: unknown[]) {
      console.log('%c' + (typeof label === 'object' ? JSON.stringify(label) : label), 'color:mediumslateblue', ...args)
    },
  },
  logMediumSeaGreen: {
    value(...[label, ...args]: unknown[]) {
      console.log('%c' + (typeof label === 'object' ? JSON.stringify(label) : label), 'color:mediumseagreen', ...args)
    },
  },
  logLightGreen: {
    value(...[label, ...args]: unknown[]) {
      console.log('%c' + (typeof label === 'object' ? JSON.stringify(label) : label), 'color:lightgreen', ...args)
    },
  },
  logYellowGreen: {
    value(...[label, ...args]: unknown[]) {
      console.log('%c' + (typeof label === 'object' ? JSON.stringify(label) : label), 'color:yellowgreen', ...args)
    },
  },
  logOlive: {
    value(...[label, ...args]: unknown[]) {
      console.log('%c' + (typeof label === 'object' ? JSON.stringify(label) : label), 'color:olive', ...args)
    },
  },
  logMediumAquamarine: {
    value(...[label, ...args]: unknown[]) {
      console.log('%c' + (typeof label === 'object' ? JSON.stringify(label) : label), 'color:mediumaquamarine', ...args)
    },
  },
  logDarkCyan: {
    value(...[label, ...args]: unknown[]) {
      console.log('%c' + (typeof label === 'object' ? JSON.stringify(label) : label), 'color:darkcyan', ...args)
    },
  },
  logLightSkyBlue: {
    value(...[label, ...args]: unknown[]) {
      console.log('%c' + (typeof label === 'object' ? JSON.stringify(label) : label), 'color:lightskyblue', ...args)
    },
  },
  logDeepSkyBlue: {
    value(...[label, ...args]: unknown[]) {
      console.log('%c' + (typeof label === 'object' ? JSON.stringify(label) : label), 'color:deepskyblue', ...args)
    },
  },
  logCornflowerBlue: {
    value(...[label, ...args]: unknown[]) {
      console.log('%c' + (typeof label === 'object' ? JSON.stringify(label) : label), 'color:cornflowerblue', ...args)
    },
  },
})
