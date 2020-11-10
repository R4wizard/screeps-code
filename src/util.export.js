import UtilPerformance from 'util.performance'

export default (obj, name = "") => {
  UtilPerformance.measureAll(name || obj.name, obj)
  return obj
}
