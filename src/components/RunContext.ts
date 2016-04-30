import * as React from 'react'
import { IMapTasks, IStore, IResolveOptions, ITask } from './../interfaces'
import Task from '../Task'
import TaskQueue from '../TaskQueue'
import { tap } from '../effects'

const defaultResolveOpts = {
  immediate: false
}

export default class RunContext extends React.Component<any,void> {
  static displayName = 'RunContext'
  static contextTypes = {
    store: React.PropTypes.object.isRequired
  }
  static childContextTypes = {
    transact: React.PropTypes.shape({
      resolve: React.PropTypes.func,
      run: React.PropTypes.func
    })
  }
  static defaultProps = {
    onResolve: () => {}
  }

  context: any
  store: IStore
  queue: TaskQueue

  constructor(props, context) {
    super(props, context)
    this.store = context.store || props.store
    this.queue = new TaskQueue()
  }

  getChildContext() {
    return {
      transact: {
        resolve: this.resolve.bind(this),
        run: this.run.bind(this)
      }
    }
  }

  resolve(mapTaskRuns: IMapTasks, opts: IResolveOptions = defaultResolveOpts): void {
    this.queue.push(mapTaskRuns)
    if (opts.immediate) {
      this.runTasks(this.props)
    }
  }

  run(task: ITask<any,any>): void {
    this.queue.push(() => task)
    this.runTasks(this.props)
  }

  runTasks(props): void {
    this.queue.run(
      this.store.dispatch,
      this.store.getState(),
      props
    ).then((failedTasks) => {
      props.onResolve(failedTasks)
    })
  }

  componentDidMount() {
    this.runTasks(this.props)
  }

  componentWillReceiveProps(nextProps) {
    setTimeout(() => {
      // Only call run if there are tasks to run, otherwise `onResolve` will trigger unnecessarily.
      if (this.queue.size > 0) {
        this.runTasks(nextProps)
      }
    }, 0)
  }

  render() {
    const { children } = this.props
    const onlyChild = React.Children.only(children)
    return React.cloneElement(onlyChild)
  }
}
