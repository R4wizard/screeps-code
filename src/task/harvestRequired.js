import Export from 'util.export'
import TaskBaseAToB from 'task.base.atob'
import ControllerRoom from 'controller.room'

class TaskHarvestRequired extends TaskBaseAToB {

  static selectSource(fsm, task) {
    return ControllerRoom.findEnergySource(fsm.ctx.room)
  }

  static handleCollect(fsm, target) {
    return fsm.ctx.harvest(target)
  }

  static handleDeliver(fsm, target) {
    return fsm.ctx.transfer(target, RESOURCE_ENERGY)
  }

}

export default Export(TaskHarvestRequired)
