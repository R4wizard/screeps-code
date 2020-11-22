import { RandomArray, RandomArrays } from 'util.random'
import Emojis from 'util.emojis'
import FSM from 'util.fsm'
import Tasks from 'tasks'
import Export from 'util.export'
import ControllerRoom from 'controller.room'


class RoleSayHello extends FSM {

  static machine = {
    init: 'idle',
    transitions: [
      // Standard loop (look for task, perform task, task finished)
      { name: 'seekPath',   from: 'any',            to: 'seekingPath' },
      { name: 'travelPath', from: 'seekingPath',    to: 'travellingPath' },
      { name: 'moveRandom', from: 'any',            to: 'movingRandomly' },
      { name: 'sayHello',   from: 'movingRandomly', to: 'sayingHello' },

      { name: 'seekPathFromIdle',   from: 'idle',   to: 'seekingPath' },
    ],
    icons: {
      idle: '❓',
      seekingPath: '💭',
      travellingPath: '🚄',
      movingRandomly: '🎲',
      sayingHello: '💬'
    }
  }

  static onIdle(fsm) {
    fsm.seekPathFromIdle()
  }

  static onSeekingPath(fsm) {
    fsm.ctx.memory.path = fsm.ctx.pos.findPathTo(new RoomPosition(fsm.ctx.memory.goal.x, fsm.ctx.memory.goal.y, fsm.ctx.memory.goal.room))

    fsm.travelPath()
  }

  static onTravellingPath(fsm) {
    const pos = fsm.ctx.pos
    if(pos.x == fsm.ctx.memory.goal.x && pos.y == fsm.ctx.memory.goal.y && pos.roomName == fsm.ctx.memory.goal.room)
      return fsm.moveRandom()

    if(pos.x*pos.y === 0 || pos.x === 49 || pos.y === 49) {
      if(pos.roomName != fsm.ctx.memory.currentRoom)
        return fsm.ctx.travelTo(new RoomPosition(25,25, pos.roomName))
    }

    fsm.ctx.memory.currentRoom = pos.roomName
    const path = fsm.ctx.memory.path
    if(fsm.ctx.moveByPath(path) == -5)
      fsm.seekPath()
  }

  static onEnterMovingRandomly(fsm) {
    let structs = fsm.ctx.room.find(FIND_STRUCTURES)
    let creeps = fsm.ctx.room.find(FIND_CREEPS)
    let sources = fsm.ctx.room.find(FIND_SOURCES)
    const entry = RandomArray(structs.concat(creeps).concat(sources))
    if(entry == null)
      return fsm.seekPath()
    fsm.ctx.memory.moveTo = entry.id
  }

  static onMovingRandomly(fsm) {
    const target = Game.getObjectById(fsm.ctx.memory.moveTo)
    if(!target || fsm.ctx.pos.isNearTo(target))
      return fsm.sayHello()
    fsm.ctx.travelTo(target)
  }

  static onEnterSayingHello(fsm) {
    fsm.ctx.memory.helloTick = 0
    fsm.ctx.memory.msg = RandomArray(Emojis)
  }

  static onSayingHello(fsm) {
    fsm.ctx.say(fsm.ctx.memory.msg, true)
    fsm.ctx.memory.helloTick++
    if(fsm.ctx.memory.helloTick >= 5)
      fsm.moveRandom()
  }

}

export default Export(RoleSayHello)
