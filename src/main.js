import Controller from 'controller'
import { SpawnCounts } from 'roles'
import UtilPerformance from 'util.performance'
import UtilConsole from 'util.console'

export const loop = () => {
  UtilPerformance.clear()

  UtilConsole.startBuffering()
  const duration = UtilPerformance.measure(() => Controller.loop())
  const logBuffer = UtilConsole.flushBuffer()
  UtilConsole.stopBuffering()

  const durationAvg = Memory.graphs.durations.reduce((acc, val) => acc + val, 0) / Memory.graphs.durations.length

  trackGraph("durations", duration)
  if(Game.time % 5 == 0)
    trackGraph("durationsAvg", durationAvg)

  if(Game.time % 5 == 0) {
    for(let role in SpawnCounts) {
      let count = _.filter(Game.creeps, creep => creep.memory.role == role).length
      trackGraph("creeps_" + role, count)
    }
  }

  if(!Memory.debug) {
    Memory.debug = {
      tick:  false,
      roles: false,
      log:   false,
      performance: {
        depth:  0,
        warnAt: 5,
      },
      fsm: {
        events: false,
        visual: false,
      },
    }
  }

  UtilConsole.header("Tick " + Game.time)

  if(Memory.debug.tick == true) {
    const gclProgress = (Game.gcl.progress/Game.gcl.progressTotal*100).toFixed(2)
    const gplProgress = (Game.gpl.progress/Game.gpl.progressTotal*100).toFixed(2)
    const ptr         = Game.shard.ptr ? "-PTR" : ""
    const tickData = {
      Shard:       Game.shard.name,
      Type:        Game.shard.type + ptr,
      GCL:         `${Game.gcl.level} (${gclProgress}%)`,
      GPL:         `${Game.gpl.level} (${gplProgress}%)`,

      CPU:         `${Game.cpu.getUsed().toFixed(1)} / ${Game.cpu.tickLimit} (~${durationAvg.toFixed(1)})`,
      Spawns:      Object.keys(Game.spawns).length,
      Rooms:       Object.keys(Game.rooms).length,
      Creeps:      Object.keys(Game.creeps).length,

      PowerCreeps: Object.keys(Game.powerCreeps).length,
      Structures:  Object.keys(Game.structures).length,
      Flags:       Object.keys(Game.flags).length,
      ConSites:    Object.keys(Game.constructionSites).length,
    }
    consoleChunk("Tick Data", () => {
      UtilConsole.table(tickData)
    })
  }

  if(Memory.debug.roles == true) {
      const creepRoles = {}
      const creepGraphs = []
      for(let role in SpawnCounts) {
        let count = _.filter(Game.creeps, creep => creep.memory.role == role).length
        creepRoles[role] = `${count} / ${SpawnCounts[role]}`
        creepGraphs.push(Memory.graphs["creeps_" + role])
      }

      consoleChunk("Roles", () => {
        console.log()
        UtilConsole.plot(creepGraphs, {
          unit: "creeps",
          unitScale: 0,
          height: 4,
          colors: UtilConsole.colors,
          alternate: true,
        })
        console.log()
        UtilConsole.table(creepRoles, UtilConsole.colors)
      })
  }

  if(Memory.debug.performance.depth > 0) {
    consoleChunk("Performance", () => {
      console.log()
      UtilConsole.plot(Memory.graphs.durations, {
        unit: "cpu",
        unitScale: 2,
        colors: ['#ccc'],
      })
      console.log()
      UtilConsole.plot(Memory.graphs.durationsAvg, {
        unit: "cpu",
        unitScale: 2,
        height: 5,
        colors: ['#777'],
      })
      console.log()
      UtilPerformance.display()
    })
  }

  if(Memory.debug.log == true) {
    consoleChunk("Log", () => {
      logBuffer.forEach(l => console.log(l))
    })
  }

}

const consoleChunk = (title, fn) => {
  //UtilConsole.startBuffering()
  UtilConsole.subheader(title)
  fn()
  //UtilConsole.stopBuffering()
  //console.log(UtilConsole.flushBuffer().join('\n') + "\n&nbsp;")
}

const trackGraph = (graph, point) => {
  if(!Memory.graphs) Memory.graphs = {}
  if(!Memory.graphs[graph]) Memory.graphs[graph] = []

  while(Memory.graphs[graph].length >= 93)
    Memory.graphs[graph].shift()
  Memory.graphs[graph].push(point)
}
