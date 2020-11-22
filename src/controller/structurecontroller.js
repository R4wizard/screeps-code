import ControllerRoom from 'controller.room'
import Export from 'util.export'

class ControllerStructureController {

  static run(structure) {
    if(structure.memory.taskId)
      return this.updateTask(structure)

    if(structure.progress < structure.progressTotal)
      this.createTask(structure)
  }

  static createTask(structure) {
    const taskId = ControllerRoom.createTask(structure.room, "upgradeRequired", {
      priority: 6,
      target: structure.id,
      desiredCreep: [WORK, MOVE, CARRY],
      progress: structure.progress,
      progressTotal: structure.progressTotal,
      maximumCreeps: 4,
    })
    structure.memory.taskId = taskId
  }

  static updateTask(structure) {
    const task = ControllerRoom.getTask(structure.room, structure.memory.taskId)
    if(!task) {
      delete structure.memory.taskId
      return
    }

    task.progress = structure.progress
    task.progressTotal = structure.progressTotal

    if(task.progress >= task.progressTotal)
      ControllerRoom.removeTask(structure.room, task.id)
  }

}

export default Export(ControllerStructureController)
