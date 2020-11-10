import Export from 'util.export'
import NameGen from 'util.namegen'

class FactoryCreep {

  static spawn(role) {
    //let spec = [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
    let spec = [WORK, CARRY, MOVE, MOVE]
    //if(role == "harvester")
      //spec = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
    //Game.spawns['SpawnMain'].spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE], `${NameGen()}-${role}`, { memory: { role: role }})
    //Game.spawns['SpawnMain'].spawnCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE], `${NameGen()}-${role}`, { memory: { role: role }})
    //Game.spawns['SpawnMain'].spawnCreep([WORK, WORK, CARRY, MOVE, MOVE], `${NameGen()}-${role}`, { memory: { role: role }})
    //Game.spawns['SpawnMain'].spawnCreep([WORK, WORK, CARRY, MOVE], `${NameGen()}-${role}`, { memory: { role: role }})
    Game.spawns['SpawnMain'].spawnCreep(spec, `${NameGen()}-${role}`, { memory: { role: role }})
  }

}

export default Export(FactoryCreep)
