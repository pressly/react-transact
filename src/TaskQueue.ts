import { IAction, IActionThunk, ITask, IMapTasks } from './interfaces'

class TaskQueue {
  private queue: Array<IMapTasks>

  constructor() {
    this.queue = []
  }

  get size() {
    return this.queue.length
  }

  push(a: IMapTasks) {
    this.queue.push(a)
  }

  run(dispatch: IActionThunk<any>, state: any, props: any): Promise<ITask<any,any>[]> {
    if (this.size === 0) {
      return Promise.resolve([])
    } else {
      return new Promise<any>((res) => {
        // WATCH OUT! THIS WILL MUTATE
        let count = 0
        let failedTasks = []

        this.queue.forEach((f: IMapTasks) => {
          f(state, props).forEach((task: ITask<any,any>) => {
            count = count + 1
            // Bump to next tick so we give all tasks a chance to increment
            // count before being forked.
            setTimeout(() => task.fork(
              (a: IAction<any>) => {
                count = count - 1
                dispatch(a)
                failedTasks.push(task)

                // Once the last computation finishes, resolve promise.
                if (count === 0) {
                  res(failedTasks)
                }
              },
              (b: IAction<any>) => {
                count = count - 1
                dispatch(b)

                // Once the last computation finishes, resolve promise.
                if (count === 0) {
                  res(failedTasks)
                }
              }
            ), 0)
          })
        })
      }).then((failedTasks: ITask<any,any>[]) => {
        this.queue = []
        return failedTasks
      })
    }
  }
}

export default TaskQueue
