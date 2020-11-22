import ControllerRoom from 'controller.room'
import Export from 'util.export'

class ControllerConstructionSite {

  static run(site) {
    if(site.memory.taskId)
      return this.updateTask(site)

    if(site.progress < site.progressTotal)
      this.createTask(site)
  }

  static createTask(site) {
    const taskId = ControllerRoom.createTask(site.room, "constructionRequired", {
      priority: 5,
      target: site.id,
      desiredCreep: [WORK, MOVE, CARRY],
      progress: site.progress,
      progressTotal: site.progressTotal,
    })
    site.memory.taskId = taskId
  }

  static updateTask(site) {
    const task = ControllerRoom.getTask(site.room, site.memory.taskId)
    if(!task) {
      delete site.memory.taskId
      return
    }

    task.progress = site.progress
    task.progressTotal = site.progressTotal

    if(task.progress >= task.progressTotal)
      ControllerRoom.removeTask(site.room, task.id)
  }

}

export default Export(ControllerConstructionSite)
