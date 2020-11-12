import Export from 'util.export'

class ControllerSpawn {

  static run(spawn) {
    console.log("executing spawn: " + spawn.id)
  }

}

export default Export(ControllerSpawn)
