import Export from 'util.export'
import { FindEnergyStorageOrSource } from 'util.find'
import RoleBaseAToB from 'role.base.atob'

class RoleUpgrader extends RoleBaseAToB {

  static selectSource(fsm) {
    return FindEnergyStorageOrSource(fsm.ctx.room)
  }

  static selectDest(fsm) {
    return fsm.ctx.room.controller
  }

  static handleCollect(fsm, target) {
    if(target instanceof Source)
      return fsm.ctx.harvest(target)
    return fsm.ctx.withdraw(target, RESOURCE_ENERGY)
  }

  static handleDeliver(fsm, target) {
    return fsm.ctx.upgradeController(target)
  }

}

export default Export(RoleUpgrader)
