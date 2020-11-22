import Export from 'util.export'

class FinateStateMachine {

  constructor(handler, ctx, stateKey = "state") {
    this.handler = handler
    this.machine = handler.machine
    this.ctx     = ctx

    if(!this.ctx.memory[stateKey])
      this.ctx.memory[stateKey] = this.machine.init

    this.stateKey = stateKey
    this.state = this.ctx.memory[stateKey]

    this._states = []
    this._transitions = this.machine.transitions

    this._transitions.forEach(t => {
      if(!t.camelName)
        t.camelName = t.name.substr(0, 1).toUpperCase() + t.name.substr(1)

      this[t.name] = () => this.transition(t.name)
      if(!this._states.find(s => s.name == t.to))
        this._states.push({ name: t.to })
      if(!this._states.find(s => s.name == t.from))
        this._states.push({ name: t.from })
    })

    this._states.forEach(s => {
      s.camelName = s.name.substr(0, 1).toUpperCase() + s.name.substr(1)
    })
  }

  run() {
    if(Memory.forceResetFSM == true)
      this.state = this.machine.init

    const spec = this.allStates().find(s => s.name == this.state)
    if(!spec)
      throw new Error(`Cannot find state '${this.state}' in computed states list.`)

    this.trigger("", spec)

    if(typeof this.onAny == "function")
      return this.onAny.call(this.handler, this)

    if(this.stateKey == Memory.debug.fsm.track && this.ctx.room instanceof Room && this.ctx.pos instanceof RoomPosition) {
      const visualOpts = {
        color: 'white',
        backgroundColor: '#000000',
        backgroundPadding: 0.1,
        opacity: 0.5,
      }

      const fsmName = `${this.handler.name.replace(/^(Task|Role)/, '')}`
      const fsmSate = `${this.state}`
      this.ctx.room.visual.text(fsmName, this.ctx.pos.x, this.ctx.pos.y - 0.4, { ...visualOpts, font: 0.17 })
      this.ctx.room.visual.text(fsmSate, this.ctx.pos.x, this.ctx.pos.y + 0.4, { ...visualOpts, font: 0.15 })
    }
  }

  transition(transition) {
    const spec = this.transitions().find(t => t.name == transition)
    if(!spec)
      throw new Error(`Cannot use transition '${transition}' from state '${this.state}'.`)

    const to = this._states.find(s => s.name == spec.to)
    const from = this._states.find(s => s.name == spec.from)

    this.trigger("Before", spec)
    this.trigger("Leave", from)

    this.state = spec.to
    this.ctx.memory[this.stateKey] = spec.to

    this.trigger("Enter", to)
    this.trigger("After", spec)
  }

  is(state) {
    return this.state == state
  }

  can(state) {
    return this.transitions().indexOf(state) !== -1
  }

  cannot(state) {
    return !this.can(state)
  }

  transitions() {
    return this._transitions.filter(t => t.from == this.state || t.from == "any")
  }

  allTransitions() {
    return this._transitions
  }

  allStates() {
    return this._states
  }

  trigger(eventName, spec) {
    if(typeof this[`on${eventName}${spec.camelName}`] == "function") {
      if(Memory.debug.fsm.track == this.stateKey)
        console.log(`  [${this.ctx.name}] ${this.handler.name}:on${eventName}${spec.camelName}`)
      return this[`on${eventName}${spec.camelName}`].call(this.handler, this)
    }
  }

}

export default class FSM {

  static run(ctx, stateKey = "state") {
    const fsm = new FinateStateMachine(this, ctx, stateKey)

    fsm.allTransitions().forEach(t => {
      fsm['onBefore' + t.camelName] = this['onBefore' + t.camelName]
      fsm['onAfter' + t.camelName] = this['onAfter' + t.camelName]
    })

    fsm.allStates().forEach(s => {
      fsm['onLeave' + s.camelName] = this['onLeave' + s.camelName]
      fsm['on' + s.camelName] = this['on' + s.camelName]
      fsm['onEnter' + s.camelName] = this['onEnter' + s.camelName]
    })

    fsm.onAny = this.onAny

    fsm.run()

    if(this.machine.icons) {
      if(!ctx.__stateIcons)
        ctx.__stateIcons = []
      ctx.__stateIcons.unshift(this.machine.icons[fsm.state])
    }
  }

}
