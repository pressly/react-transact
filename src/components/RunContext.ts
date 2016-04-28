import * as React from 'react'
import { IMapTasks, IStore } from './../interfaces'
import TaskQueue from './../TaskQueue'

type IProps = {
  onResolve: Function
  store: IStore
  location: any
  params: any
}

export default class RunContext extends React.Component<IProps,void> {
  static displayName = 'RunContext'
  static contextTypes = {
    store: React.PropTypes.object.isRequired
  }
  static childContextTypes = {
    resolve: React.PropTypes.func
  }
  static defaultProps = {
    onResolve: () => {}
  }

  context: IProps

  store: IStore
  queue: TaskQueue

  constructor(props, context) {
    super(props, context)
    this.store = context.store || props.store
    this.queue = new TaskQueue()
  }

  getChildContext() {
    return {
      resolve: (mapTaskRuns: IMapTasks): void => {
        this.queue.push(mapTaskRuns)
      }
    }
  }

  runTasks(props) {
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
    setTimeout(() => this.runTasks(nextProps), 0)
  }

  render() {
    const { children } = this.props
    const onlyChild = React.Children.only(children)
    return React.cloneElement(onlyChild)
  }
}
