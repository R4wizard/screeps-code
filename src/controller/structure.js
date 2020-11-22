import ControllerRoom from 'controller.room'
import Export from 'util.export'

class ControllerStructure {

  static run(structure) {
    if(structure.memory.repairTaskId)
      return this.updateRepairTask(structure)

    if(structure.hits < structure.hitsMax * 0.75)
      this.createRepairTask(structure)
  }

  static createRepairTask(structure) {
    const taskId = ControllerRoom.createTask(structure.room, "repairRequired", {
      priority: 3,
      target: structure.id,
      desiredCreep: [WORK, MOVE, CARRY],
      progress: structure.hits,
      progressTotal: structure.hitsMax,
    })
    structure.memory.repairTaskId = taskId
  }

  static updateRepairTask(structure) {
    const task = ControllerRoom.getTask(structure.room, structure.memory.repairTaskId)
    if(!task) {
      delete structure.memory.repairTaskId
      return
    }

    task.progress = structure.hits
    task.progressTotal = structure.hitsMax

    if(task.progress >= task.progressTotal)
      ControllerRoom.removeTask(structure.room, task.id)
  }

}

export default Export(ControllerStructure)
