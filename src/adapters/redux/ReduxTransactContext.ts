import * as React from 'react'
import { IStore, IResolveOptions, ITask } from '../../interfaces'
import {SCHEDULE_TASKS, RUN_SCHEDULED_TASKS, STANDALONE_INIT} from '../../actions'

const defaultResolveOpts = {
  immediate: false
}

const { any, func, object, shape, bool } = React.PropTypes

export default class ReduxTransactContext extends React.Component<any,any> {
  static displayName = 'ReduxTransactContext'
  static contextTypes = {
    store: object
  }
  static childContextTypes = {
    transact: shape({
      skipInitialRoute: any,
      store: any,
      resolve: func,
      run: func
    })
  }
  static propTypes = {
    skipInitialRoute: bool
  }

  state: any
  context: any
  store: IStore

  constructor(props, context) {
    super(props, context)

    this.state = { initialized: false }

    // Using store from redux
    this.store = context.store || props.store

    setTimeout(() => this.runTasks(), 0)
  }

  getChildContext() {
    return {
      transact: {
        initialized: this.state.initialized,
        skipInitialRoute: this.props.skipInitialRoute,
        store: this.store,
        resolve: this.resolve.bind(this),
        run: this.run.bind(this)
      }
    }
  }

  componentDidMount() {
    this.setState({ initialized: true })
  }

  componentWillReceiveProps() {
    setTimeout(() => this.runTasks(), 0)
  }

  resolve(tasks: Array<ITask<any,any>> | ITask<any,any>, opts: IResolveOptions = defaultResolveOpts): void {
    this.store.dispatch({ type: SCHEDULE_TASKS, payload: tasks })
    if (opts.immediate) {
      // Bump to next tick to avoid synchronous component render issue.
      setTimeout(() => this.runTasks())
    }
  }

  run(tasks: Array<ITask<any,any>> | ITask<any,any>, props: any): void {
    this.store.dispatch({
      type: SCHEDULE_TASKS,
      payload: tasks
    })
    this.runTasks()
  }

  runTasks(): void {
    this.store.dispatch({ type: RUN_SCHEDULED_TASKS })
  }

  render() {
    const { children } = this.props
    const onlyChild = React.Children.only(children)
    return React.cloneElement(onlyChild, { store: this.store })
  }
}
