import Export from 'util.export'
import FSM from 'util.fsm'
import ControllerRoom from 'controller.room'

class TaskRecycleMyself extends FSM {

  static machine = {
    init: 'idle',
    transitions: [
      // Standard loop (go to spawn, recycle self)
      { name: 'travelSpawn',  from: 'idle',             to: 'travellingSpawn' },
      { name: 'recycle',      from: 'travellingSpawn',  to: 'recycling' },

      // Couldn't find a spawner
      { name: 'noValidSpawn', from: 'travellingSpawn',  to: 'idle' },
    ],
    icons: {
      idle: '❓',
      travellingSpawn: '➡️',
      recycling: '♻️',
    }
  }

  static onIdle(fsm) {
    fsm.travelSpawn()
  }

  static onEnterTravellingSpawn(fsm) {
    const task = ControllerRoom.getTask(fsm.ctx.room, fsm.ctx.memory.taskId)
    const spawns = Object.values(Game.spawns).filter(s => s.room == fsm.ctx.room)

    if(spawns.length == 0)
      return fsm.noValidSpawn()

    fsm.ctx.memory.target = spawns[0].id
  }

  static onTravellingSpawn(fsm) {
    const target = Game.getObjectById(fsm.ctx.memory.target)
    if(target == undefined)
      return fsm.noValidSpawn()
    if(fsm.ctx.pos.isNearTo(target))
      return fsm.recycle()

    fsm.ctx.travelTo(target, {visualizePathStyle: {stroke: '#ffaa00'}})
  }

  static onRecycling(fsm) {
    const task = ControllerRoom.getTask(fsm.ctx.room, fsm.ctx.memory.taskId)
    const target = Game.getObjectById(fsm.ctx.memory.target)
    target.recycleCreep(fsm.ctx)
  }

}

export default Export(TaskRecycleMyself)
