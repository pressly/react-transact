import * as React from 'react'
import { MapperWithProps, IStore, IResolveOptions, ITask } from '../interfaces'
import ComponentStateStore, { INIT } from '../internals/ComponentStateStore'
import {SCHEDULE_TASKS, RUN_SCHEDULED_TASKS} from '../actions'

const defaultResolveOpts = {
  immediate: false
}

const { func, object, shape } = React.PropTypes

export default class RunContext extends React.Component<any,any> {
  static displayName = 'RunContext'
  static contextTypes = {
    store: object
  }
  static childContextTypes = {
    transact: shape({
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

    if (typeof props.stateReducer === 'undefined') {
      this.store = context.store || props.store
      this.state = {}
    } else {
      this.state = props.stateReducer(undefined, INIT)
      this.store = ComponentStateStore(
        props.stateReducer,
        () => this.state,
        this.setState.bind(this)
      )
    }

    setTimeout(() => this.runTasks(), 0)
  }

  getChildContext() {
    return {
      transact: {
        resolve: this.resolve.bind(this),
        run: this.run.bind(this)
      }
    }
  }

  componentWillReceiveProps() {
    setTimeout(() => this.runTasks(), 0)
  }

  resolve(mapTaskRuns: MapperWithProps, opts: IResolveOptions = defaultResolveOpts): void {
    this.store.dispatch({
      type: SCHEDULE_TASKS, payload: mapTaskRuns
    })
    if (opts.immediate) {
      this.runTasks()
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
