import * as React from 'react'
import { RouterContext } from 'react-router'
import RunContext from './../components/RunContext'
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
  location: ILocation
  params: any
}

const RUN_CONTEXT = 'RUN_CONTEXT'

const locationChanged = (a: ILocation, b: ILocation): boolean => {
  return a.search !== b.search || a.pathname !== b.pathname
}

export default class RouterRunContext extends React.Component<IProps,void> {
  static displayName = 'RouterRunContext'
  static propTypes = {
    render: React.PropTypes.func
  }
  static contextTypes = {
    store: React.PropTypes.object.isRequired
  }
  static defaultProps = {
    render: (props) => {
      return React.createElement(RouterContext, props)
    }
  }
  context: {
    store: any
  }
  _location: ILocation
  constructor(props) {
    super(props)
    this._location = { pathname: '', search: '' }
  }
  componentDidMount() {
    this._location = this.props.location
  }
  componentDidUpdate() {
    if (locationChanged(this._location, this.props.location)) {
      const ctx = this.refs[RUN_CONTEXT] as RunContext
      this.props.components
        .map(c => c._mapTasks)
        .filter(f => typeof f === 'function')
        .forEach((mapper) => ctx.resolve(mapper, { immediate: true }))
    }
    this._location = this.props.location
  }
  render() {
    const props = Object.assign({}, this.props)
    const render = props.render
    props.render = undefined
    return (
      <RunContext
        ref={RUN_CONTEXT}
        store={this.context.store || props.store}
        onResolve={props.onResolve}
        params={props.params}
        location={props.location}>
        { render(props) }
      </RunContext>
    )
  }
}
