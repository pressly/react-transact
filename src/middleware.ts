import {IStore, IAction} from "./interfaces";
import {RUN_SCHEDULED_TASKS, SCHEDULE_TASKS} from './actions'
import TaskQueue from './internals/TaskQueue';

const makeMiddleware = (queue: TaskQueue) => {
  queue = queue || new TaskQueue()

  let _res: Function = () => {}
  const done = new Promise((res) => {
    _res = res
  })
  let pendingCount = 0

  const middleware: any = (store: IStore) => (next: Function) => (action: IAction<any>) => {
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
          })
        return
      default:
        return next(action)
    }
  }

  middleware.done = done

  return middleware
}

export default makeMiddleware
