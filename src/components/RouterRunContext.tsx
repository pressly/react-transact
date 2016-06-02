import * as React from 'react'
import { RouterContext } from 'react-router'
import RunContext from './RunContext'
import { IStore } from '../interfaces'

type ILocation = {
  pathname: string
  search: string
}

type IProps = {
  components: Array<any>
  render: Function
  onResolve: Function
  store: IStore
  stateReducer: Function
  location: ILocation
  params: any
}

const locationChanged = (a: ILocation, b: ILocation): boolean => {
  return a.search !== b.search || a.pathname !== b.pathname
}

export default class RouterRunContext extends React.Component<IProps,void> {
  static displayName = 'RouterRunContext'
  static propTypes = {
    render: React.PropTypes.func
  }
  static contextTypes = {
    store: React.PropTypes.object,
    stateReducer: React.PropTypes.func
  }
  static defaultProps = {
    render: (props) => {
      return React.createElement(RouterContext, props)
    }
  }
  context: {
    store: any,
    stateReducer: any
  }
  runContext: RunContext
  componentWillUpdate(nextProps) {
    if (locationChanged(this.props.location, nextProps.location)) {
      const ctx = this.runContext
      this.props.components
        .map(c => c._mapTasks)
        .filter(f => typeof f === 'function')
        .forEach((mapper) => ctx.resolve({ mapper, props: this.props }, { immediate: true }))
    }
  }
  render() {
    const props = Object.assign({}, this.props)
    const render = props.render
    props.render = undefined
    return (
      <RunContext
        ref={(ref: RunContext) => {
          this.runContext = ref
        }}
        store={this.context.store || props.store}
        stateReducer={this.context.stateReducer || props.stateReducer}
        onResolve={props.onResolve}
        params={props.params}
        location={props.location}>
        { render(props) }
      </RunContext>
    )
  }
}
