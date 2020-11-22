import Export from 'util.export'
import FSM from 'util.fsm'
import ControllerRoom from 'controller.room'

class TaskBaseAToB extends FSM {

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
    icons: {
      idle: '❓',
      travellingSource: '⬅️',
      collecting: '📤',
      travellingDest: '➡️',
      delivering: '📥'
    }
  }

  static onEnterIdle(fsm) {
    const task = ControllerRoom.getTask(fsm.ctx.room, fsm.ctx.memory.taskId)
    ControllerRoom.returnTask(fsm.ctx.room, task, fsm.ctx)
  }

  static onIdle(fsm) {
    fsm.travelSource()
  }

  static onEnterTravellingSource(fsm) {
    const task = ControllerRoom.getTask(fsm.ctx.room, fsm.ctx.memory.taskId)
    const source = this.selectSource(fsm, task)
    if(source == undefined)
      return fsm.noValidSource()
    fsm.ctx.memory.target = source.id
  }

  static onTravellingSource(fsm) {
    const target = Game.getObjectById(fsm.ctx.memory.target)
    if(target == undefined)
      return fsm.noValidSource()
    if(fsm.ctx.pos.isNearTo(target))
      return fsm.collect()

    fsm.ctx.travelTo(target, {visualizePathStyle: {stroke: '#ffaa00'}})
  }

  static onCollecting(fsm) {
    const task = ControllerRoom.getTask(fsm.ctx.room, fsm.ctx.memory.taskId)
    const target = Game.getObjectById(fsm.ctx.memory.target)
    if(fsm.ctx.store.getFreeCapacity() == 0)
      return fsm.travelDest()

    if(this.handleCollect(fsm, target, task) != OK)
      return fsm.drainedSource()
  }

  static onTravellingDest(fsm) {
    const task = ControllerRoom.getTask(fsm.ctx.room, fsm.ctx.memory.taskId)
    const target = Game.getObjectById(task.target)
    if(target == undefined)
      return fsm.noValidDest()
    if(fsm.ctx.pos.isNearTo(target))
      return fsm.deliver()
    fsm.ctx.travelTo(target, {visualizePathStyle: {stroke: '#ffffff'}})
  }

  static onDelivering(fsm) {
    const task = ControllerRoom.getTask(fsm.ctx.room, fsm.ctx.memory.taskId)
    const target = Game.getObjectById(task.target)
    if(fsm.ctx.store.getUsedCapacity() == 0)
      return fsm.idle()

    if(this.handleDeliver(fsm, target, task) != OK)
      return fsm.filledTarget()
  }

}

export default Export(TaskBaseAToB)
