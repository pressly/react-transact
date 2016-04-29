import { IAction, IActionThunk, ITask, IMapTasks } from './interfaces'

type IResult = {
  task: ITask<any,any>
  action: IAction<any>
  rejected: boolean
}

class TaskQueue {
  private queue: Array<IMapTasks>
  private pending: Promise<IResult[]>

  constructor() {
    this.queue = []
    this.pending = Promise.resolve([])
  }

  get size() {
    return this.queue.length
  }

  push(a: IMapTasks) {
    this.queue.push(a)
  }

  run(dispatch: IActionThunk<any>, state: any, props: any): Promise<IResult[]> {
    // WARNING: Mutation will occur.
    let newPending

    if (this.size === 0) {
      newPending = Promise.resolve([])
    } else {
      // WARNING: Mutating the queue so the next run call won't run through same queued tasks.
      const currentQueue = this.queue
      this.queue = []
      newPending = new Promise<any>((res) => {
        // WARNING: Watch out! These will mutate!
        let count = 0
        let results = []

        currentQueue.forEach((f: IMapTasks) => {
          const x = f(state, props)
          const tasks = Array.isArray(x) ? x : [x]
          tasks.forEach((task: ITask<any,any>) => {
            count = count + 1
            
            // Bump to next tick so we give all tasks a chance to increment
            // count before being forked.
            setTimeout(() => task.fork(
              (a: IAction<any>) => {
                count = count - 1
                dispatch(a)

                results.push({
                  task, action: a, rejected: true
                })

                // Once the last computation finishes, resolve promise.
                if (count === 0) {
                  res(results)
                }
              },
              (b: IAction<any>) => {
                count = count - 1
                dispatch(b)

                results.push({
                  task, action: b, rejected: false
                })

                // Once the last computation finishes, resolve promise.
                if (count === 0) {
                  res(results)
                }
              }
            ), 0)
          })
        })
      }).then((results: IResult[]) => {
        return results
      })
    }
    // Chaining the previous pending tasks so they will resolve in order.
    this.pending = this.pending.then(() => newPending)
    return this.pending
  }
}

export default TaskQueue
