import Export from 'util.export'

class FinateStateMachine {

  constructor(handler, creep) {
    this.handler = handler
    this.machine = handler.machine
    this.creep   = creep

    if(!this.creep.memory.state)
      this.creep.memory.state = this.machine.init

    this.state = this.creep.memory.state

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
    this.trigger("", spec)

    if(Memory.debug.fsm.visual) {
      this.creep.room.visual.text(`${this.handler.name}:${this.state}`, this.creep.pos, {
        color: 'white',
        backgroundColor: '#000000',
        backgroundPadding: 0.1,
        opacity: 0.5,
        font: 0.3,
      })
    }
  }

  transition(transition) {
    const spec = this.transitions().find(t => t.name == transition)
    if(!spec)
      throw new Error(`Cannot use transition '${transition}' from state '${this.creep.memory.state}'.`)

    const to = this._states.find(s => s.name == spec.to)
    const from = this._states.find(s => s.name == spec.from)

    this.trigger("Before", spec)
    this.trigger("Leave", from)

    this.state = spec.to
    this.creep.memory.state = spec.to

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
    return this._transitions.filter(t => t.from == this.state)
  }

  allTransitions() {
    return this._transitions
  }

  allStates() {
    return this._states
  }

  trigger(eventName, spec) {
    if(typeof this[`on${eventName}${spec.camelName}`] == "function") {
      if(Memory.debug.fsm.events)
        console.log(`  ${this.creep.name}: on${eventName}${spec.camelName}`)
      return this[`on${eventName}${spec.camelName}`].call(this.handler, this)
    }
  }

}

export default class FSM {

  static run(creep) {
    const fsm = new FinateStateMachine(this, creep)

    fsm.allTransitions().forEach(t => {
      fsm['onBefore' + t.camelName] = this['onBefore' + t.camelName]
      fsm['onAfter' + t.camelName] = this['onAfter' + t.camelName]
    })

    fsm.allStates().forEach(s => {
      fsm['onLeave' + s.camelName] = this['onLeave' + s.camelName]
      fsm['on' + s.camelName] = this['on' + s.camelName]
      fsm['onEnter' + s.camelName] = this['onEnter' + s.camelName]
    })

    fsm.run()
  }

}
