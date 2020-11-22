import FSM from 'util.fsm'
import Tasks from 'tasks'
import Export from 'util.export'
import ControllerRoom from 'controller.room'

class RoleFSM extends FSM {

  static machine = {
    init: 'idle',
    transitions: [
      // Standard loop (look for task, perform task, task finished)
      { name: 'seekTask',    from: 'idle',        to: 'seekingTask' },
      { name: 'performTask', from: 'seekingTask', to: 'performingTask' },
      { name: 'finishTask',  from: 'any',         to: 'idle' },
    ],
    icons: {
      idle: '❓',
      seekingTask: '💭',
      performingTask: '📋'
    }
  }

  static onEnterIdle(fsm) {
    fsm.ctx.memory.idleTicks = 0
  }

  static onIdle(fsm) {
    if(fsm.ctx.memory.idleTicks++ > 4)
      fsm.ctx.travelTo(Game.flags.FlagIdle, {visualizePathStyle: {stroke: 'yellow'}})
    fsm.seekTask()
  }

  static onSeekingTask(fsm) {
    const task = ControllerRoom.allocateTask(fsm.ctx.room, fsm.ctx)

    if(!task)
      return fsm.finishTask()

    delete fsm.ctx.memory.stateTask
    fsm.ctx.memory.taskId = task.id
    fsm.performTask()
  }

  static onPerformingTask(fsm) {
    const task = ControllerRoom.getTask(fsm.ctx.room, fsm.ctx.memory.taskId)
    if(!task || task.workforce.indexOf(fsm.ctx.name) === -1)
      return fsm.finishTask()

    const target = Game.getObjectById(task.target)
    if(target)
      fsm.ctx.room.visual.line(fsm.ctx.pos, target.pos, {color: 'purple', lineStyle: 'dashed', opacity: 0.1});

    try {
      const taskHandler = Tasks[task.type]
      if(taskHandler == undefined)
        throw new Error("Task handler not defined.")
      taskHandler.run(fsm.ctx, "stateTask")
    } catch(e) {
      console.log(`Exception when executing task '${task.type}':`)
      console.log(e.stack)
    }
  }

}

export default Export(RoleFSM)
