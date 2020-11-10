import Export from 'util.export'
import { FindEnergyStorageOrSource } from 'util.find'
import RoleBaseAToB from 'role.base.atob'

class RoleUpgrader extends RoleBaseAToB {

  static selectSource(fsm) {
    return FindEnergyStorageOrSource(fsm.creep.room)
  }

  static selectDest(fsm) {
    return fsm.creep.room.controller
  }

  static handleCollect(fsm, target) {
    if(target instanceof Source)
      return fsm.creep.harvest(target)
    return fsm.creep.withdraw(target, RESOURCE_ENERGY)
  }

  static handleDeliver(fsm, target) {
    return fsm.creep.upgradeController(target)
  }

}

export default Export(RoleUpgrader)
