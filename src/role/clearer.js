import Export from 'util.export'
import { RandomArrays } from 'util.random'
import { FindEnergyStorage } from 'util.find'
import RoleBaseAToB from 'role.base.atob'

class RoleClearer extends RoleBaseAToB {

  static selectSource(fsm) {
    const ruins = fsm.ctx.room.find(FIND_RUINS, {
      filter: object => object.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    })
    const tombstones = fsm.ctx.room.find(FIND_TOMBSTONES, {
      filter: object => object.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    })
    const dropped = fsm.ctx.room.find(FIND_DROPPED_RESOURCES)
    return RandomArrays(ruins, tombstones, dropped)
  }

  static selectDest(fsm) {
    return FindEnergyStorage(fsm.ctx.room)
  }

  static handleCollect(fsm, target) {
    if(target instanceof Ruin || target instanceof Tombstone)
      return fsm.ctx.withdraw(target, RESOURCE_ENERGY)
    return fsm.ctx.pickup(target)
  }

  static handleDeliver(fsm, target) {
    return fsm.ctx.transfer(target, RESOURCE_ENERGY)
  }

}

export default Export(RoleClearer)
