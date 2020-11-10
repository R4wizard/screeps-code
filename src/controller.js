import Export from 'util.export'
import Roles from 'roles'
import { SpawnCounts } from 'roles'
import FactoryCreep from 'factory.creep'

class Controller {

  static loop() {
    this.cleanUp()
    this.handleSpawning()
    this.executeRoles()
  }

  static cleanUp() {
    for(let name in Memory.creeps) {
      if(Game.creeps[name])
        continue

      delete Memory.creeps[name]
    }
  }

  static handleSpawning() {
    for(let role in SpawnCounts) {
      let count = _.filter(Game.creeps, creep => creep.memory.role == role).length
      if(count < SpawnCounts[role])
        return FactoryCreep.spawn(role)
    }
  }

  static executeRoles() {
    for(let name in Game.creeps) {
      try {
        const creep = Game.creeps[name]
        const role = Roles[creep.memory.role]
        if(role != undefined) {
          role.run(creep)
        } else if(Memory.autoSuicide == true) {
          creep.suicide()
        } else {
          console.log(`Warning: Creep ${creep.name} has an invalid role, set Memory.autoSuicide = true or resolve the issue manually.`)
        }
      } catch(e) {
        console.log(`Exception when executing role for '${name}':`)
        console.log(e.stack)
      }
    }

    Memory.forceResetFSM = false
  }

}

export default Export(Controller)
