import Export from 'util.export'
import { RandomArray } from 'util.random'
import FactoryCreep from 'factory.creep'

class ControllerRoom {

  static run(room) {
    if(!room.controller || !room.controller.my)
      return

    room.structures = Object.values(Game.structures).filter(s => s.room == room)
    room.constructionSites = Object.values(Game.constructionSites).filter(s => s.room == room)

    this.handleRoomTask(room)
    this.handleBaseBuilding(room)
    this.handleTasks(room)
    this.handleSpawning(room)
  }

  static handleRoomTask(room) {
    const task = room.memory.roomTask
    // here we handle the more 'global' plays ("we're working towards conquering x")
    // this can then create room tasks to handle things or abandon the room task and
    // seek another
  }

  static handleBaseBuilding(room) {
    const level = room.controller.level

    this.handleBaseBuildingStructure(room, level, STRUCTURE_EXTENSION, [15, 15, 21, 19])
    this.handleBaseBuildingStructure(room, level, STRUCTURE_CONTAINER, [19, 23, 22, 25])
    this.handleBaseBuildingStructure(room, level, STRUCTURE_TOWER,     [26, 20, 27, 21])
  }


  static findEnergyStorageOrSource(room) {
    const storage = this.findEnergyStorage(room)
    if(storage)
      return storage
    return this.findEnergySource(room)
  }

  static findEnergyStorage(room) {
    const containers = room.find(FIND_STRUCTURES, {
      filter: structure =>
        (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) &&
        structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    })
    if(containers.length)
      return RandomArray(containers)
    return undefined
  }

  static findEnergyTombstone(room) {
    const tombstones = room.find(FIND_TOMBSTONES, {
      filter: tombstone => tombstone.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    })
    if(tombstones.length)
      return RandomArray(tombstones)
    return undefined
  }

  static findEnergySource(room) {
    return RandomArray(room.find(FIND_SOURCES))
  }

  static findEnergy(room, ignoreStorage = false) {
    const tombstone = this.findEnergyTombstone(room)
    if(tombstone)
      return tombstone

    if(ignoreStorage == true)
      return this.findEnergySource(room)

    return this.findEnergyStorage(room)
  }

  static findFirstFreeSpaceInAreaGrid(room, top, left, bottom, right) {
    const area = room.lookAtArea(top, left, bottom, right)
    let position = null
    for(let y = top; y <= bottom; y += 1) {
      let offset = y % 2 == 0 ? 1 : 0
      for(let x = left; x <= right; x += 2) {
        let shiftedX = x + offset
        if(shiftedX > right)
          continue

        if(area[y][shiftedX].length == 1 && area[y][shiftedX][0].type == "terrain")
          return [Number(shiftedX), Number(y)]
      }
    }
    return null
  }

  static handleBaseBuildingStructure(room, level, structure, [top, left, bottom, right] = [0, 0, 0, 0]) {
    const building = room.constructionSites.filter(s => s.structureType == structure).length
    const built = room.find(FIND_STRUCTURES, { filter: s => s.structureType == structure }).length
    const total = building + built
    const desired = CONTROLLER_STRUCTURES[structure][level]

    console.log(`[BB] ${structure}: ${building} building, ${built} built, ${total} total, ${desired} desired`)
    if(total >= desired)
      return

    const position = this.findFirstFreeSpaceInAreaGrid(room, top, left, bottom, right)
    console.log("[BB] " + JSON.stringify(position))

    if(position == null) {
      console.log("[BB] Warning: failed to find spot to build in!")
      return
    }

    const res = room.createConstructionSite(position[0], position[1], structure)
    if(res != OK)
      console.log("[BB] Error: " + res)
  }

  static handleTasks(room) {
    if(!room.memory.tasks)
      room.memory.tasks = []

    for(let task of room.memory.tasks) {
      // Remove tasks for targets that don't exist anymore
      if(!Game.getObjectById(task.target)) {
        const index = room.memory.tasks.indexOf(task)
        room.memory.tasks.splice(index, 1)
      }

      // Remove dead creeps from task workforces
      for(let creep of task.workforce) {
        if(Game.creeps[creep] == undefined)
          this.returnTask(room, task, null, creep)
      }

      // Remove tasks which don't desire creeps, and have no creeps
      if(task.desiredCreep == null && task.workforce.length == 0) {
        const index = room.memory.tasks.indexOf(task)
        room.memory.tasks.splice(index, 1)
      }
    }

    // Display tasks debug
    if(Memory.debug.tasks == true) {
      const sortedTasks = this.sortTasks(room)
      for(let i = 0; i < sortedTasks.length && i < 20; i++) {
        const task = sortedTasks[i]
        const target = Game.getObjectById(task.target)
        if(!target) continue
        room.visual.text(
          `${i+1}. ${target.id} (${target.structureType}): ${task.type} [${task.progress}/${task.progressTotal}] (priority: ${task.priority}, workers: ${task.workforce.length}/${task.maximumCreeps}) ${JSON.stringify(task.data)}`,
          0, i*0.5, {
            color: 'white',
            backgroundColor: '#000000',
            backgroundPadding: 0.1,
            opacity: 0.5,
            font: 0.3,
            align: 'left',
          }
       )
      }
    }
  }

  static handleSpawning(room) {
    if(!Game.creeps.SayHello1)
      return Game.spawns.SpawnMain.spawnCreep([MOVE,CARRY,WORK], "SayHello1", {memory:{role:"sayhello","goal":{x:28,y:37,room:"W3N4"}}})
    if(!Game.creeps.SayHello2)
      return Game.spawns.SpawnMain.spawnCreep([MOVE,CARRY,WORK], "SayHello2", {memory:{role:"sayhello","goal":{x:37,y:18,room:"W6N7"}}})

    let desired = Math.min(16, room.memory.tasks.length * 2)
    let count = _.filter(Game.creeps, creep => creep.memory.role == "fsm" && creep.room == room && creep.ticksToLive > 50).length
    console.log(`handling spawn, desired:${desired}, count:${count}`)
    if(count < desired)
      return FactoryCreep.spawn("fsm", room)
  }

  static createTask(room, type, {
    priority = 5,
    target,
    desiredCreep = [WORK, MOVE, CARRY],
    progress = 0,
    progressTotal = 0,
    workforce = [],
    maximumCreeps = 2
  }, data = {}) {
    if(!room.memory.tasks)
      room.memory.tasks = []

    const id = Math.random() * 10000000 | 0
    room.memory.tasks.push({
      id, priority, type, target, desiredCreep, progress, progressTotal, data, workforce, maximumCreeps,
      lowWorkforceSince: Game.time,
    })
    return id
  }

  static getTask(room, id) {
    if(!room.memory.tasks)
      room.memory.tasks = []
    return room.memory.tasks.find(t => t.id == id)
  }

  static removeTask(room, id) {
    if(!room.memory.tasks)
      room.memory.tasks = []
    const index = room.memory.tasks.findIndex(t => t.id == id)
    room.memory.tasks.splice(index, 1)
  }

  static allocateTask(room, creep = null) {
    if(!room.memory.tasks)
      room.memory.tasks = []

    let sortedTasks = this.sortTasks(room, creep)
    let filteredTasks = sortedTasks.filter(t => t.workforce.length < t.maximumCreeps && t.desiredCreep != null)

    if(filteredTasks.length == 0) {
      return null
      // @todo the below logic should recycle a creep but we get oddness sometimes?
      //       might work now, but it's late and i'm going in circles
      if(creep == null)
        return

      const recycleTaskId = this.recycleCreepIfIdle(creep)
      if(!recycleTaskId)
        return
      filteredTasks = room.memory.tasks.filter(t => t.id == recycleTaskId)
    }

    const task = filteredTasks[0]
    if(creep != null) {
      delete creep.memory.noTaskSince
      task.workforce.push(creep.name)
    }
    return task
  }

  static returnTask(room, task, creep = null, creepId = null) {
    const id = creep ? creep.id : creepId
    const index = task.workforce.indexOf(id)
    task.workforce.splice(index, 1)
    if(creep)
      delete creep.memory.taskId
  }

  static sortTasks(room, creep = null) {
    return [...room.memory.tasks].sort((a, b) => {
      return a.priority < b.priority ? 1 : -1
    })
  }





  static recycleCreepIfIdle(creep) {
    if(!creep.memory.noTaskSince)
      creep.memory.noTaskSince = Game.time

    if(Game.time - creep.memory.noTaskSince < 10)
      return

    const spawns = Object.values(Game.spawns).filter(s => s.room == creep.room)
    if(spawns.length == 0)
      return null

    return this.createTask(creep.room, "recycleMyself", {
      priority: 999,
      target: spawns[0].id,
      desiredCreep: null,
      workforce: [creep.id],
      progress: 0,
      progressTotal: 1
    })
  }

}

export default Export(ControllerRoom)
