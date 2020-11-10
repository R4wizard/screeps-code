import { RandomArray } from 'util.random'

export const FindEnergyStorageOrSource = room => {
  const storage = FindEnergyStorage(room)
  if(storage)
    return storage
  return RandomArray(room.find(FIND_SOURCES))
}

export const FindEnergyStorage = room => {
  const containers = room.find(FIND_STRUCTURES, {
    filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
  })
  if(containers.length)
    return RandomArray(containers)
  return undefined
}
