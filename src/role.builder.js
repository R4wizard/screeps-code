import Export from 'util.export'
import { RandomArray } from 'util.random'
import { FindEnergyStorageOrSource } from 'util.find'
import RoleBaseAToB from 'role.base.atob'

class RoleBuilder extends RoleBaseAToB {

  static selectSource(fsm) {
    return FindEnergyStorageOrSource(fsm.creep.room)
  }

  static selectDest(fsm) {
    const selectedSite = Game.getObjectById(fsm.creep.memory.site)
    if(selectedSite)
      return selectedSite

    const sites = fsm.creep.room.find(FIND_CONSTRUCTION_SITES)
    if(sites.length == 0)
      return

    sites.sort((a, b) => {
      const aPercent = a.progress / a.progressTotal
      const bPercent = b.progress / b.progressTotal
      return aPercent > bPercent ? -1 : 1
    })

    fsm.creep.memory.site = sites[0].id
    return sites[0]
  }

  static handleCollect(fsm, target) {
    if(target instanceof Source)
      return fsm.creep.harvest(target)
    return fsm.creep.withdraw(target, RESOURCE_ENERGY)
  }

  static handleDeliver(fsm, target) {
    return fsm.creep.build(target)
  }

}

export default Export(RoleBuilder)
