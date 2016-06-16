import { IAction, IActionThunk, ITask, ITaskResult, ITransaction } from '../interfaces'
import Task from './Task'
import {compact} from "./helpers";
type RunResults = Array<ITaskResult<any,any>>
type PendingRunReturn = Promise<RunResults>

/*
 * The `TaskQueue` is responsible for queueing and resolving tasks. Each `run` call
 * returns a promise that resolves with the results of the tasks.
 *
 * Total order is guaranteed for all task results, and each run calls. That is, every
 * call to `run` will only resolve afer the previous `run` has resolved. The results
 * array is ordered by the same ordering as the submitted tasks array.
 */
class TaskQueue {
  private queue: Array<ITransaction>
  private pending: PendingRunReturn

  constructor() {
    this.queue = []
    this.pending = Promise.resolve([])
  }

  get size() { return this.queue.length }

  push(a: Array<ITask<any,any>> | ITask<any,any>) {
    let tasks: Array<ITask<any,any>>

    if (Array.isArray((a))) {
      tasks = a
    } else if (a instanceof Task) {
      tasks = [a]
    } else {
      throw new Error('TaskQueue#push must be passed a Task instance.')
    }

    this.queue.push({ tasks: compact(tasks) })
  }

  run(onResult: IActionThunk<any>): PendingRunReturn {
    const size = this.size
    const prevPending = this.pending

    // Chaining the previous pending tasks so they will resolve in order.
    const chained = new Promise((outerResolve) => {
      if (size === 0) {
        outerResolve([])
      } else {
        // WARNING: Mutating the queue so the next run call won't run through same queued tasks.
        const currentQueue = this.queue
        this.queue = []

        // WARNING: Watch out! This will mutate!
        let count = 0

        currentQueue.reduce((acc: PendingRunReturn, transaction: ITransaction): PendingRunReturn => {
          // If a component applies transformations using `.chain` but need to commit one of the intermediary
          // actions to the system, then this commit function can be used.
          // TODO: Provide a mechanism for committing intermediary task results.
          // const commit = Task.tap((task: ITask<any, any>, action, rejected: boolean) => {
          //   onResult(action)
          // })

          const { tasks } = transaction

          return acc.then((accResults: RunResults) => {
            return new Promise((innerResolve) => {
              // No tasks to run? Resolve immediately.
              if (tasks.length === 0) {
                innerResolve(accResults)
              }

              let results = []

              tasks.forEach((task: ITask<any,any>) => {
                count = count + 1

                const rejAndRes = (a: IAction<any>) => {
                  count = count - 1

                  // Ensure the previous `run` completes before we invoke the callback.
                  // This is done to guarantee total ordering of action dispatches.
                  prevPending.then(() => onResult(a))

                  results.push({ task, result: a })

                  // Once the last computation finishes, resolve promise.
                  if (count === 0) {
                    innerResolve(accResults.concat(results))
                  }
                }

                // Bump to next tick so we give all tasks a chance to increment
                // count before being forked.
                setTimeout(() => task.fork(
                  rejAndRes,
                  rejAndRes,
                  (c) => prevPending.then(() => onResult(c))
                ), 0)
              })
            })
          })
        }, Promise.resolve([])).then((results: RunResults) => {
          outerResolve(results)
        })
      }
    })

    // Set the pending promise to the next in chain.
    this.pending = this.pending.then(() => chained)

    // Return new pending promise so the caller can wait for all previously scheduled tasks
    // and currently scheduled tasks to complete before resolution (total ordering).
    return this.pending
  }
}

export default TaskQueue
