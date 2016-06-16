import * as React from 'react'
import { IResolveOptions, ITask } from '../interfaces'
import Task from "../internals/Task";
import TaskQueue from "../internals/TaskQueue";

const defaultResolveOpts = { immediate: false }

const { any, func, object, shape } = React.PropTypes

type Effect = (...args: any[]) => any
type TasksOrEffects = Array<ITask<any,any> | Effect> | ITask<any,any> | Effect

const toTasks = (x: TasksOrEffects): Array<ITask<any,any>> => {
  const arr: Array<ITask<any,any> | Effect> = Array.isArray(x) ? x : [x]
  return arr.map((a) => {
    if (a instanceof Task) {
      return a
    } else if (a instanceof Function) {
      return new Task((rej, res) => {
        try {
          const b = a()
          if (b && typeof b.then === 'function') {
            b.then(c => res(c), d => rej(d))
          } else {
            res(b)
          }
        } catch (e) {
          rej(e)
        }
      })
    }
  })
}

export default class TransactContext extends React.Component<any,any> {
  static displayName = 'TransactContext'

  static contextTypes = {
    store: object
  }

  static childContextTypes = {
    transact: shape({
      store: any,
      resolve: func,
      run: func
    })
  }

  static propsTypes = {
    onReady: func,
    onBeforeRun: func,
    onAfterRun: func,
    onResult: func
  }

  static defaultProps = {
    onReady: () => {},
    onBeforeRun: () => {},
    onAfterRun: () => {},
    onResult: () => {}
  }

  ready: Function
  context: any
  taskQueue: TaskQueue

  constructor(props, context) {
    super(props, context)
    this.taskQueue = new TaskQueue()
    setTimeout(() => this.runTasks(), 0)

    new Promise(res => {
      this.ready = res
    }).then(() => this.props.onReady())
  }

  getChildContext() {
    return {
      transact: {
        resolve: this.resolve.bind(this),
        run: this.run.bind(this)
      }
    }
  }

  resolve(tasksOrEfects: TasksOrEffects, opts: IResolveOptions = defaultResolveOpts): void {
    this.taskQueue.push(toTasks(tasksOrEfects))
    if (opts.immediate) {
      // Bump to next tick to avoid synchronous component render issue.
      setTimeout(() => this.runTasks())
    }
  }

  run(tasksOrEfects: TasksOrEffects): void {
    this.taskQueue.push(toTasks(tasksOrEfects))
    this.runTasks()
  }

  runTasks(): void {
    const { onBeforeRun, onAfterRun, onResult } = this.props
    onBeforeRun()
    this.taskQueue.run(onResult).then(() => {
      onAfterRun()
      this.ready()
    })
  }

  render() {
    return this.props.children
  }
}
