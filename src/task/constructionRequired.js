import Export from 'util.export'
import TaskBaseAToB from 'task.base.atob'
import ControllerRoom from 'controller.room'

class TaskConstructionRequired extends TaskBaseAToB {

  static selectSource(fsm) {
    return ControllerRoom.findEnergy(fsm.ctx.room)
  }

  static handleCollect(fsm, target) {
    if(target instanceof Source)
      return fsm.ctx.harvest(target)
    return fsm.ctx.withdraw(target, RESOURCE_ENERGY)
  }

  static handleDeliver(fsm, target) {
    return fsm.ctx.build(target)
  }

}

export default Export(TaskConstructionRequired)
