///<reference path="../internals/helpers.ts"/>
import * as React from 'react'
import {IResolveOptions, TasksOrEffects} from '../interfaces'
import TaskQueue from "../internals/TaskQueue";
import {toTasks} from "../internals/helpers";

const defaultResolveOpts = { immediate: false }

const { object, func, shape } = React.PropTypes

export default class TransactContext extends React.Component<any,any> {
  static displayName = 'TransactContext'

  static childContextTypes = {
    transact: shape({
      skipInitialRoute: object,
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

  state: any
  ready: Function
  context: any
  taskQueue: TaskQueue

  constructor(props, context) {
    super(props, context)
    this.state = { initialized: false }
    this.taskQueue = new TaskQueue()
    setTimeout(() => this.runTasks(), 0)

    new Promise(res => {
      this.ready = res
    }).then(() => this.props.onReady())
  }

  getChildContext() {
    return {
      transact: {
        initialized: this.state.initialized,
        skipInitialRoute: this.props.skipInitialRoute,
        resolve: this.resolve.bind(this),
        run: this.run.bind(this)
      }
    }
  }
  
  componentDidMount() {
    this.setState({ initialized: true })
  }

  resolve(tasksOrEffects: TasksOrEffects, opts: IResolveOptions = defaultResolveOpts): void {
    this.taskQueue.push(toTasks(tasksOrEffects))
    if (opts.immediate) {
      this.runTasks()
    }
  }

  run(tasksOrEffects: TasksOrEffects): void {
    this.taskQueue.push(toTasks(tasksOrEffects))
    this.runTasks()
  }

  runTasks(): void {
    const { onBeforeRun, onAfterRun, onResult } = this.props
    onBeforeRun()
    // Bump to next tick to avoid synchronous component render issue.
    setTimeout(() => this.taskQueue.run(onResult).then(() => {
      onAfterRun()
      this.ready()
    }))
  }

  render() {
    return this.props.children
  }
}
