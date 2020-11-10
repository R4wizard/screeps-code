import Export from 'util.export'
import FSM from 'util.fsm'

class RoleBaseAToB extends FSM {

  static machine = {
    init: 'idle',
    transitions: [
      // Standard loop (go to source, collect thing, go to dest, deliver thing, return to idle)
      { name: 'travelSource',  from: 'idle',             to: 'travellingSource' },
      { name: 'collect',       from: 'travellingSource', to: 'collecting' },
      { name: 'travelDest',    from: 'collecting',       to: 'travellingDest' },
      { name: 'deliver',       from: 'travellingDest',   to: 'delivering' },
      { name: 'idle',          from: 'delivering',       to: 'idle' },

      // Source drained while collecting
      { name: 'drainedSource', from: 'collecting',       to: 'travellingSource' },

      // Destination filled while delivering
      { name: 'filledTarget',  from: 'delivering',       to: 'travellingDest' },

      // Couldn't find a source
      { name: 'noValidSource', from: 'travellingSource', to: 'idle' },

      // Couldn't find a destination
      { name: 'noValidDest',   from: 'travellingDest',   to: 'idle' },
    ],
  }

  static onIdle(fsm) {
    fsm.creep.moveTo(Game.flags.FlagIdle, {visualizePathStyle: {stroke: 'yellow'}})
    fsm.travelSource()
  }

  static onEnterTravellingSource(fsm) {
    const source = this.selectSource(fsm)
    if(source == undefined)
      return fsm.noValidSource()
    fsm.creep.memory.target = source.id
  }

  static onTravellingSource(fsm) {
    const target = Game.getObjectById(fsm.creep.memory.target)
    if(target == undefined)
      return fsm.noValidSource()
    if(fsm.creep.pos.isNearTo(target))
      return fsm.collect()
    fsm.creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}})
  }

  static onCollecting(fsm) {
    const target = Game.getObjectById(fsm.creep.memory.target)
    if(fsm.creep.store.getFreeCapacity() == 0)
      return fsm.travelDest()

    if(this.handleCollect(fsm, target) != OK)
      return fsm.drainedSource()
  }

  static onEnterTravellingDest(fsm) {
    const dest = this.selectDest(fsm)
    if(dest == undefined)
      return fsm.noValidDest()
    fsm.creep.memory.target = dest.id
  }

  static onTravellingDest(fsm) {
    const target = Game.getObjectById(fsm.creep.memory.target)
    if(target == undefined)
      return fsm.noValidDest()
    if(fsm.creep.pos.isNearTo(target))
      return fsm.deliver()
    fsm.creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}})
  }

  static onDelivering(fsm) {
    const target = Game.getObjectById(fsm.creep.memory.target)
    if(fsm.creep.store.getUsedCapacity() == 0)
      return fsm.idle()

    if(this.handleDeliver(fsm, target) != OK)
      return fsm.filledTarget()
  }

}

export default Export(RoleBaseAToB)
