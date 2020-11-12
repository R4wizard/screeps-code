import Export from 'util.export'
import { RandomArray } from 'util.random'
import RoleBaseAToB from 'role.base.atob'

class RoleHarvester extends RoleBaseAToB {

  static selectSource(fsm) {
    return RandomArray(fsm.ctx.room.find(FIND_SOURCES_ACTIVE))
  }

  static selectDest(fsm) {
    const spawns = fsm.ctx.room.find(FIND_STRUCTURES, {
      filter: (structure) => structure.structureType == STRUCTURE_SPAWN && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    })
    if(spawns.length)
      return spawns[0]

    const extensions = fsm.ctx.room.find(FIND_STRUCTURES, {
      filter: (structure) => structure.structureType == STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    })
    if(extensions.length)
      return extensions[0]

    const containers = fsm.ctx.room.find(FIND_STRUCTURES, {
      filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    })
    if(containers.length)
      return containers[0]
  }

  static handleCollect(fsm, target) {
    return fsm.ctx.harvest(target)
  }

  static handleDeliver(fsm, target) {
    return fsm.ctx.transfer(target, RESOURCE_ENERGY)
  }

}

export default Export(RoleHarvester)
