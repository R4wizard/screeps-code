import Export from 'util.export'
import { RandomArray } from 'util.random'
import { FindEnergyStorageOrSource } from 'util.find'
import RoleBaseAToB from 'role.base.atob'

class RoleBuilder extends RoleBaseAToB {

  static selectSource(fsm) {
    return FindEnergyStorageOrSource(fsm.ctx.room)
  }

  static selectDest(fsm) {
    const selectedSite = Game.getObjectById(fsm.ctx.memory.site)
    if(selectedSite)
      return selectedSite

    const sites = fsm.ctx.room.find(FIND_CONSTRUCTION_SITES)
    if(sites.length == 0)
      return

    sites.sort((a, b) => {
      const aPercent = a.progress / a.progressTotal
      const bPercent = b.progress / b.progressTotal
      return aPercent > bPercent ? -1 : 1
    })

    fsm.ctx.memory.site = sites[0].id
    return sites[0]
  }

  static handleCollect(fsm, target) {
    if(target instanceof Source)
      return fsm.ctx.harvest(target)
    return fsm.ctx.withdraw(target, RESOURCE_ENERGY)
  }

  static handleDeliver(fsm, target) {
    return fsm.ctx.build(target)
  }

}

export default Export(RoleBuilder)
