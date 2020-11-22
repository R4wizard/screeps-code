import ControllerRoom from 'controller.room'
import { RandomArray } from 'util.random'
import Export from 'util.export'

class ControllerStructureTower {

  static run(structure) {
    this.attemptToHelp(structure)

    if(structure.memory.taskId)
      return this.updateTask(structure)

    if(structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
      this.createTask(structure)
  }

  static createTask(structure) {
    const taskId = ControllerRoom.createTask(structure.room, "energyRequired", {
      priority: 7,
      target: structure.id,
      desiredCreep: [WORK, MOVE, CARRY],
      progress: structure.store.getUsedCapacity(RESOURCE_ENERGY),
      progressTotal: structure.store.getCapacity(RESOURCE_ENERGY),
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

    task.progress = structure.store.getUsedCapacity(RESOURCE_ENERGY)
    task.progressTotal = structure.store.getCapacity(RESOURCE_ENERGY)

    if(task.progress >= task.progressTotal)
      ControllerRoom.removeTask(structure.room, task.id)
  }

  static attemptToHelp(structure) {
    const toAttack = RandomArray(structure.room.find(FIND_HOSTILE_CREEPS))
    if(toAttack)
      return structure.attack(toAttack)

    const toHeal = RandomArray(structure.room.find(FIND_MY_CREEPS, {
      filter: s => s.hits < s.hitsMax
    }))
    if(toHeal)
      return structure.heal(toHeal)

    const toRepair = RandomArray(structure.room.find(FIND_STRUCTURES, {
      filter: s => s.hits < s.hitsMax
    }))
    if(toRepair)
      return structure.repair(toRepair)
  }

}

export default Export(ControllerStructureTower)
