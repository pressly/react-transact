import * as React from 'react'
import { RouterContext } from 'react-router'
import RunContext from './../components/RunContext'
import { IStore } from '../interfaces'

type IProps = {
  render: Function
  onResolve: Function
  store: IStore
  location: any
  params: any
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
  render() {
    const props = Object.assign({}, this.props)
    const render = props.render
    props.render = undefined
    return (
      <RunContext
        store={this.context.store || props.store}
        onResolve={props.onResolve}
        params={props.params}
        location={props.location}>
        { render(props) }
      </RunContext>
    )
  }
}
