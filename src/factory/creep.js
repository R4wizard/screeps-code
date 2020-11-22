import Export from 'util.export'
import NameGen from 'util.namegen'

class FactoryCreep {

  static computeSpec(role, room) {
    let maximumParts = room.structures.filter(s => s.structureType == STRUCTURE_EXTENSION).length + 3

    let creepsInRoom = Object.values(Game.creeps).filter(c => c.room == room).length
    if(maximumParts == 3 || creepsInRoom < 3)
      return [WORK, CARRY, MOVE]

    const partsForMovement = Math.ceil(maximumParts / 2)
    const partsForBody = maximumParts - partsForMovement

    const spec = []
    for(let i = 0; i < partsForBody; i++)
      spec.push(i % 2 ? WORK : CARRY)
    for(let i = 0; i < partsForBody; i++)
      spec.push(MOVE)

    return spec
  }

  static spawn(role, room) {
    let spec = this.computeSpec(role, room)
    spec.sort()
    //spec = [WORK, CARRY, MOVE]
    const res = Game.spawns['SpawnMain'].spawnCreep(spec, `${NameGen()}-${role}`, { memory: { role }})
    if(res != OK)
      console.log("failed to spawn creep: " + res)
  }

}

export default Export(FactoryCreep)
