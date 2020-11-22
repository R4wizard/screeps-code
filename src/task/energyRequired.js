import Export from 'util.export'
import TaskBaseAToB from 'task.base.atob'
import ControllerRoom from 'controller.room'

class TaskEnergyRequired extends TaskBaseAToB {

  static selectSource(fsm, task) {
    return ControllerRoom.findEnergy(fsm.ctx.room, task.data.ignoreStorage)
  }

  static handleCollect(fsm, target) {
    if(target instanceof Source)
      return fsm.ctx.harvest(target)
    return fsm.ctx.withdraw(target, RESOURCE_ENERGY)
  }

  static handleDeliver(fsm, target) {
    return fsm.ctx.transfer(target, RESOURCE_ENERGY)
  }

}

export default Export(TaskEnergyRequired)
