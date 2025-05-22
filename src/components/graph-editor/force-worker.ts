import { simulate } from './simulation.ts'
self.onmessage = async e => {
	simulate(e.data, { animate: false })
	postMessage(e.data)
}