import ControllerRoom from 'controller.room'
import Export from 'util.export'

class ControllerStructureSpawn {

  static run(structure) {
    if(structure.memory.taskId)
      return this.updateTask(structure)

    if(structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
      this.createTask(structure)
  }

  static createTask(structure) {
    const taskId = ControllerRoom.createTask(structure.room, "energyRequired", {
      priority: 10,
      target: structure.id,
      desiredCreep: [WORK, MOVE, CARRY],
      progress: structure.store.getUsedCapacity(RESOURCE_ENERGY),
      progressTotal: structure.store.getCapacity(RESOURCE_ENERGY),
    })
    structure.memory.taskId = taskId
  }

  static updateTask(structure) {
    const task = ControllerRoom.getTask(structure.room, structure.memory.taskId)
    if(!task) {
      delete structure.memory.taskId
      return
    }

    task.progress = structure.store.getUsedCapacity(RESOURCE_ENERGY)
    task.progressTotal = structure.store.getCapacity(RESOURCE_ENERGY)

    if(task.progress >= task.progressTotal)
      ControllerRoom.removeTask(structure.room, task.id)
  }

}

export default Export(ControllerStructureSpawn)
