// import RoleHarvester from 'role.harvester'
// import RoleUpgrader from 'role.upgrader'
// import RoleBuilder from 'role.builder'
// import RoleRepairer from 'role.repairer'
// import RoleClearer from 'role.clearer'
import RoleSayHello from 'role.sayhello'
import RoleFSM from 'role.fsm'

export default {
  // harvester: RoleHarvester,
  // upgrader:  RoleUpgrader,
  // builder:   RoleBuilder,
  // repairer:  RoleRepairer,
  // clearer:   RoleClearer,
  sayhello:  RoleSayHello,
  fsm:       RoleFSM,
}

export const CalculateRequirements = room => {

  for(let role in SpawnCounts) {
    let count = _.filter(Game.creeps, creep => creep.memory.role == role).length
    if(count < SpawnCounts[role])
      return FactoryCreep.spawn(role)
  }
}

export const SpawnCounts = {
  // harvester: 5,
  // builder:   2,
  // upgrader:  4,
  // repairer:  2,
  // clearer:   1,
  sayhello:  1,
  fsm:       15,
}
