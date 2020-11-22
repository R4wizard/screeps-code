let stack

export default class UtilPerformance {

  static measureAll(title, obj) {
    const props = Object.getOwnPropertyNames(obj)
    for(let i = 0; i < props.length; i++) {
      const key = props[i]
      if(typeof obj[key] !== 'function')
        continue

      const existing = obj[key]
      obj[key] = function() {
        const firstArg = arguments.length > 0 && typeof arguments[0] == "string" ? `"${arguments[0]}"` : ""
        const measurement = stack[stack.length - 1].measure(`${title}:${key}(${firstArg})`)
        const result = existing.apply(this, arguments)
        measurement.stop()
        return result
      }
    }
  }

  static measure(fn) {
    const start = Game.cpu.getUsed()
    fn()
    return Game.cpu.getUsed() - start
  }

  static clear() {
    stack = [new PerformanceEntry("ROOT")]
  }

  static display(entry = null, depth = 0) {
    if(depth > Memory.debug.performance.depth)
      return

    if(entry == null)
      entry = stack[0]

    const indent = (new Array(depth*3)).join(' ')
    const title = `${indent}${entry.title}`
    const duration = `${entry.duration.toFixed(2)}cpu`
    const durationTime = `${entry.durationTime}ms`

    const color = entry.duration > (Memory.debug.performance.warnAt / depth) ? 'yellow' : 'darkgreen'
    if(depth != 0)
      console.log(`${title.padEnd(102 - duration.length - durationTime.length - 1)}<span style='color: ${color}'>${duration} (${durationTime})</span>`)

    for(let i = 0; i < entry.children.length; i++)
      this.display(entry.children[i], depth + 1)
  }

}

class PerformanceEntry {
  constructor(title) {
    this.title = title
    this.children = []
    this.start = null
    this.startTime = null
    this.finish = null
    this.startTime = null
    this.duration = 0
    this.durationTime = 0
  }

  measure(title) {
    const entry = new PerformanceEntry(title)
    this.children.push(entry)
    stack.push(entry)

    entry.start = Game.cpu.getUsed()
    entry.startTime = Date.now()
    return {
      stop() {
        entry.finish = Game.cpu.getUsed()
        entry.finishTime = Date.now()
        entry.duration = entry.finish - entry.start
        entry.durationTime = entry.finishTime - entry.startTime
        stack.pop()
      }
    }
  }
}
