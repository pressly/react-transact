import * as React from 'react'
import { MapperWithProps, IStore, IResolveOptions, ITask } from '../interfaces'
import ComponentStateStore from '../internals/ComponentStateStore'
import {SCHEDULE_TASKS, RUN_SCHEDULED_TASKS, STANDALONE_INIT} from '../actions'

const defaultResolveOpts = {
  immediate: false
}

const { any, func, object, shape } = React.PropTypes

export default class RunContext extends React.Component<any,any> {
  static displayName = 'RunContext'
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
    stateReducer: func
  }

  context: any
  store: IStore

  constructor(props, context) {
    super(props, context)

    // Using store from redux
    if (typeof props.stateReducer === 'undefined') {
      this.store = context.store || props.store
      this.state = {}
    // Using a standalone store
    } else {
      const getState = () => this.state
      this.state = props.stateReducer(this.state, STANDALONE_INIT)
      this.store = ComponentStateStore(
        props.stateReducer,
        getState,
        (state) => {
          setTimeout(() => this.setState(state), 0)
        }
      )
    }

    setTimeout(() => this.runTasks(), 0)
  }

  getChildContext() {
    return {
      transact: {
        store: this.store,
        resolve: this.resolve.bind(this),
        run: this.run.bind(this)
      }
    }
  }

  componentWillReceiveProps() {
    setTimeout(() => this.runTasks(), 0)
  }

  resolve(mapTaskRuns: MapperWithProps, opts: IResolveOptions = defaultResolveOpts): void {
    this.store.dispatch({ type: SCHEDULE_TASKS, payload: mapTaskRuns })
    if (opts.immediate) {
      // Bump to next tick to avoid synchronous component render issue.
      setTimeout(() => this.runTasks())
    }
  }

  run(tasks: Array<ITask<any,any>> | ITask<any,any>, props: any): void {
    this.store.dispatch({
      type: SCHEDULE_TASKS,
      payload: { mapper: () => tasks, props }
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
