import {IStore, IAction, IMapTasks, ITask} from "./interfaces"
import {RUN_SCHEDULED_TASKS, SCHEDULE_TASKS, TASKS_RESOLVED} from './actions'
import TaskQueue from './internals/TaskQueue'
import {getTaskMappers} from './internals/helpers'
import Task from './internals/Task'

type IRouterProps = {
  components: any[]
}

const makeMiddleware = (routerProps: IRouterProps) => {
  const queue = new TaskQueue()

  let _res: Function = (a :any) => {}
  const done = new Promise((res) => {
    _res = res
  })
  let pendingCount = 0

  const middleware: any = (store: IStore) => {
    if (routerProps) {
      const mappers = getTaskMappers(routerProps.components)

      // After store is created, run initial tasks, if any.
      setTimeout(() => {
        mappers.forEach((mapper: IMapTasks) => {
          store.dispatch({ type: SCHEDULE_TASKS, payload: { mapper, props: routerProps } })
        })
        store.dispatch({ type: RUN_SCHEDULED_TASKS })
      }, 0)
    }

    return (next: Function) => (action: IAction<any>|Task<any,any>) => {
      // If a task is returned, then schedule and run it.
      if (action instanceof Task) {
        queue.push({ mapper: () => [action], props: {}})
        queue
          .run(store.dispatch, store.getState())
          .then((results) => {
            _res(results)
            // Notify interested reducers about tasks resolved.
            store.dispatch({ type: TASKS_RESOLVED, payload: results })
          })
      // Otherwise, check the action type.
      } else {
        switch (action.type) {
          case SCHEDULE_TASKS:
            queue.push(action.payload)
            return
          case RUN_SCHEDULED_TASKS:
            pendingCount = pendingCount + 1
            queue
              .run(store.dispatch, store.getState())
              .then((results) => {
                pendingCount = pendingCount - 1
                if (pendingCount === 0) {
                  _res(results)
                }
                // Notify interested reducers about tasks resolved.
                store.dispatch({ type: TASKS_RESOLVED, payload: results })
              })
            return
          default:
            return next(action)
        }
      }
    }
  }

  middleware.done = done

  return middleware
}

export default makeMiddleware
