import Export from 'util.export'
import { RandomArrays } from 'util.random'
import { FindEnergyStorage } from 'util.find'
import RoleBaseAToB from 'role.base.atob'

class RoleClearer extends RoleBaseAToB {

  static selectSource(fsm) {
    const ruins = fsm.creep.room.find(FIND_RUINS, {
      filter: object => object.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    })
    const tombstones = fsm.creep.room.find(FIND_TOMBSTONES, {
      filter: object => object.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    })
    const dropped = fsm.creep.room.find(FIND_DROPPED_RESOURCES)
    return RandomArrays(ruins, tombstones, dropped)
  }

  static selectDest(fsm) {
    return FindEnergyStorage(fsm.creep.room)
  }

  static handleCollect(fsm, target) {
    if(target instanceof Ruin || target instanceof Tombstone)
      return fsm.creep.withdraw(target, RESOURCE_ENERGY)
    return fsm.creep.pickup(target)
  }

  static handleDeliver(fsm, target) {
    return fsm.creep.transfer(target, RESOURCE_ENERGY)
  }

}

export default Export(RoleClearer)
