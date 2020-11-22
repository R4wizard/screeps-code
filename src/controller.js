import Export from 'util.export'
import Roles from 'roles'
import { SpawnCounts } from 'roles'
import ControllerRoom from 'controller.room'
import ControllerStructure from 'controller.structure'
import ControllerStructureSpawn from 'controller.structurespawn'
import ControllerConstructionSite from 'controller.constructionsite'
import ControllerStructureController from 'controller.structurecontroller'
import ControllerStructureExtension from 'controller.structureextension'
import ControllerStructureContainer from 'controller.structurecontainer'
import ControllerStructureTower from 'controller.structuretower'

class Controller {

  static loop() {
    this.cleanUp()

    const unownedStructures = this.getStructuresUnowned()

    this.executeWithMemory("structures", Game.structures, this.executeStructure)
    this.executeWithMemory("structuresUnowned", unownedStructures, this.executeStructureUnowned)
    this.executeWithMemory("constructionSites", Game.constructionSites, this.executeConstructionSite)
    this.executeWithMemory("rooms", Game.rooms, this.executeRoom)
    this.executeWithMemory("creeps", Game.creeps, this.executeCreep)
  }

  static cleanUp() {
    for(let name in Memory.creeps) {
      if(Game.creeps[name])
        continue
      delete Memory.creeps[name]
    }

    for(let name in Memory.rooms) {
      if(Game.rooms[name])
        continue
      delete Memory.rooms[name]
    }

    for(let id in Memory.structures) {
      if(Game.structures[id])
        continue
      delete Memory.structures[id]
    }
  }

  static executeStructure(id, structure) {
    ControllerStructure.run(structure)

    if(structure.structureType == STRUCTURE_SPAWN)
      ControllerStructureSpawn.run(structure)

    if(structure.structureType == STRUCTURE_CONTROLLER)
      ControllerStructureController.run(structure)

    if(structure.structureType == STRUCTURE_EXTENSION)
      ControllerStructureExtension.run(structure)

    if(structure.structureType == STRUCTURE_TOWER)
      ControllerStructureTower.run(structure)
  }

  static executeStructureUnowned(id, structure) {
    ControllerStructure.run(structure)

    if(structure.structureType == STRUCTURE_CONTAINER)
      ControllerStructureContainer.run(structure)
  }

  static executeConstructionSite(id, site) {
    ControllerConstructionSite.run(site)
  }

  static executeRoom(id, room) {
    ControllerRoom.run(room)
  }

  static executeCreep(id, creep) {
    const role = Roles[creep.memory.role]
    if(role != undefined) {
      role.run(creep)
    } else if(Memory.autoSuicide == true) {
      creep.suicide()
    } else {
      console.log(`Warning: Creep ${creep.name} has an invalid role, set Memory.autoSuicide = true or resolve the issue manually.`)
    }

    if(Memory.debug.fsm.icons == true) {
      creep.__stateIcons = creep.__stateIcons || []
      creep.room.visual.text(`${creep.__stateIcons.join('')}`, creep.pos.x, creep.pos.y + 0.1, { font: 0.3, align: 'center' })
    }
  }

  static executeWithMemory(type, data, fn) {
    if(!Memory[type])
      Memory[type] = {}

    for(let id in data) {
      const entry = data[id]
      try {
        if(!Memory[type][id])
          Memory[type][id] = {}
        entry.memory = Memory[type][id]
        fn(id, entry)
      } catch(e) {
        console.log(`Exception when executing for ${type} with id ${id}:`)
        console.log(e.stack)
      }
    }
  }

  static getStructuresUnowned() {
    const results = {}
    Object.values(Game.rooms).forEach(room => {
      const roomResults = room.find(FIND_STRUCTURES, {
        filter: (n) => n.structureType == STRUCTURE_WALL || n.structureType == STRUCTURE_ROAD || n.structureType == STRUCTURE_CONTAINER
      }).forEach(entry => {
        results[entry.id] = entry
      })
    })
    return results
  }
}

export default Export(Controller)
