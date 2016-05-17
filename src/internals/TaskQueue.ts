import { IAction, IActionThunk, ITask, ITaskResult, MapperWithProps } from '../interfaces'
import { compact } from './helpers'
import Task from './Task'

/*
 * The `TaskQueue` is responsible for queueing and resolving tasks. Each `run` call
 * returns a promise that resolves with the results of the tasks.
 *
 * Total order is guaranteed for all task results, and each run calls. That is, every
 * call to `run` will only resolve afer the previous `run` has resolved. The results
 * array is ordered by the same ordering as the submitted tasks array.
 */
class TaskQueue {
  private queue: Array<MapperWithProps>
  private pending: Promise<ITaskResult[]>

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

  run(thunk: IActionThunk<any>, state: any): Promise<ITaskResult[]> {
    const chainPending = new Promise((outerResolve) => {
      if (this.size === 0) {
        outerResolve([])
      } else {
        // WARNING: Mutating the queue so the next run call won't run through same queued tasks.
        const currentQueue = this.queue
        this.queue = []

        // WARNING: Watch out! These will mutate!
        let count = 0

        currentQueue.reduce((acc: Promise<ITaskResult[]>, m: MapperWithProps): Promise<ITaskResult[]> => {
          return acc.then((accResults: ITaskResult[]) => {
            return new Promise((innerResolve) => {
              // If a component applies transformations using `.chain` but need to commit one of the intermediary
              // actions to the system, then this commit function can be used.
              const commit = Task.tap((task: ITask<any, any>, action, rejected: boolean) => {
                thunk(action)
              })

              const x = m.mapper(state, m.props, commit)
              const tasks = compact(Array.isArray(x) ? x : [x])
              // No tasks to run? Resolve immediately.
              if (tasks.length === 0) {
                innerResolve(accResults)
              }

              let results = []

              tasks.forEach((task: ITask<any,any>) => {
                count = count + 1

                // Bump to next tick so we give all tasks a chance to increment
                // count before being forked.
                setTimeout(() => task.fork(
                  (a:IAction<any>) => {
                    count = count - 1
                    // thunk(a)

                    results.push({
                      task, action: a
                    })

                    // Once the last computation finishes, resolve promise.
                    if (count === 0) {
                      innerResolve(accResults.concat(results))
                    }
                  }
                ), 0)
              })
            })
          })
        }, Promise.resolve([])).then((results: ITaskResult[]) => {
          outerResolve(results)
        })
      }
    })

    // Chaining the previous pending tasks so they will resolve in order.
    this.pending = this.pending.then(() => chainPending).then((results: ITaskResult[]) => {
      results.forEach((result: ITaskResult) => {
        thunk(result.action)
      })
      return results
    })
    return this.pending
  }
}

export default TaskQueue
