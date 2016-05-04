import { IAction, IActionThunk, ITask, IMapTasks, MapperWithProps } from './../interfaces'
import { compact } from './helpers'
import Task from './Task'

type IResult = {
  task: ITask<any,any>
  action: IAction<any>,
  rejected: boolean
}

class TaskQueue {
  private queue: Array<MapperWithProps>
  private pending: Promise<IResult[]>

  constructor() {
    this.queue = []
    this.pending = Promise.resolve([])
  }

  get size() {
    return this.queue.length
  }

  push(a: MapperWithProps) {
    if (typeof a.mapper !== 'function') {
      throw new Error('Invalid mapper passed into TaskQueue#push')
    }
    this.queue.push(a)
  }

  // TODO: Refactor this method so there isn't so many mutations going on!
  run(thunk: IActionThunk<any>, state: any): Promise<IResult[]> {
    // If a component applies transformations using `.chain` but need to commit one of the intermediary
    // actions to the system, then this commit function can be used.
    const commit = Task.tap(thunk)

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

        currentQueue.forEach((m: MapperWithProps) => {
          const x = m.mapper(state, m.props, commit)
          const tasks = compact(Array.isArray(x) ? x : [x])
          // No tasks to run? Resolve immediately.
          if (tasks.length === 0) {
            res([])
          }
          tasks.forEach((task: ITask<any,any>) => {
            count = count + 1

            // Bump to next tick so we give all tasks a chance to increment
            // count before being forked.
            setTimeout(() => task.fork(
              (a: IAction<any>) => {
                count = count - 1
                thunk(a)

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
                thunk(b)

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
