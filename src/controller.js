import Export from 'util.export'
import Roles from 'roles'
import { SpawnCounts } from 'roles'
import ControllerSpawn from 'controller.spawn'
import FactoryCreep from 'factory.creep'

class Controller {

  static loop() {
    this.cleanUp()
    this.handleSpawning()
    this.executeSpawns()
    this.executeRoles()
  }

  static cleanUp() {
    for(let name in Memory.creeps) {
      if(Game.creeps[name])
        continue
      delete Memory.creeps[name]
    }

    for(let name in Memory.spawns) {
      if(Game.spawns[name])
        continue
      delete Memory.spawns[name]
    }
  }

  static handleSpawning() {
    for(let role in SpawnCounts) {
      let count = _.filter(Game.creeps, creep => creep.memory.role == role).length
      if(count < SpawnCounts[role])
        return FactoryCreep.spawn(role)
    }
  }

  static executeSpawns() {
    if(!Memory.spawns) Memory.spawns = {}

    for(let name in Game.spawns) {
      try {
        const spawn = Game.spawns[name]
        spawn.memory = Memory.spawns[name]
        ControllerSpawn.run(spawn)
      } catch(e) {
        console.log(`Exception when executing controller for spawn '${name}':`)
        console.log(e.stack)
      }
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
        console.log(`Exception when executing role for creep '${name}':`)
        console.log(e.stack)
      }
    }

    Memory.forceResetFSM = false
  }

}

export default Export(Controller)
