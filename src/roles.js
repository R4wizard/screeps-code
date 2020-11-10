import RoleHarvester from 'role.harvester'
import RoleUpgrader from 'role.upgrader'
import RoleBuilder from 'role.builder'
import RoleRepairer from 'role.repairer'
import RoleClearer from 'role.clearer'

export default {
  harvester: RoleHarvester,
  upgrader:  RoleUpgrader,
  builder:   RoleBuilder,
  repairer:  RoleRepairer,
  clearer:   RoleClearer,
}

export const SpawnCounts = {
  harvester: 5,
  builder:   2,
  upgrader:  4,
  repairer:  2,
  clearer:   1,
}
