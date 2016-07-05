import {IRouterProps, IMapTasks} from "../interfaces"
import {getTaskMappers, toTasks} from "./helpers"
import TaskQueue from "./TaskQueue"

/*
 * Resolves all data tasks based on matched routes.
 */
const resolve = (routerProps: IRouterProps, extraProps?: any) => {
  const queue = new TaskQueue()

  const mappers = getTaskMappers(routerProps.components)
  const props = Object.assign({}, extraProps, routerProps)

  // After store is created, run initial tasks, if any.
  mappers.forEach((mapper: IMapTasks) => {
    const tasks = toTasks(mapper(props))
    queue.push(tasks)
  })

  return new Promise((res, rej) => {
    try {
      queue.run().then(res)
    } catch (e) {
      rej(e)
    }
  })
}

export default resolve
