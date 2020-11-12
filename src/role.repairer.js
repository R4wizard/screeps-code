import Export from 'util.export'
import { RandomArray } from 'util.random'
import { FindEnergyStorageOrSource } from 'util.find'
import RoleBaseAToB from 'role.base.atob'

class RoleRepairer extends RoleBaseAToB {

  static selectSource(fsm) {
    return FindEnergyStorageOrSource(fsm.ctx.room)
  }

  static selectDest(fsm) {
    return RandomArray(fsm.ctx.room.find(FIND_STRUCTURES, {
      filter: object => (object.hits < object.hitsMax) && object.hits / object.hitsMax < 0.5
    }))
  }

  static handleCollect(fsm, target) {
    if(target instanceof Source)
      return fsm.ctx.harvest(target)
    return fsm.ctx.withdraw(target, RESOURCE_ENERGY)
  }

  static handleDeliver(fsm, target) {
    return fsm.ctx.repair(target)
  }

}

export default Export(RoleRepairer)
