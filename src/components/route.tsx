import * as React from 'react'
import transact from './transact'
import { invariant, getDisplayName, shallowEqual } from '../internals/helpers'
import { IMapTasks } from "../interfaces";

const toParamProps = (paramNames, props) =>
  paramNames.reduce((acc, name) =>
    Object.assign(acc, { [name]: props.params[name] })
  , {})

type IProps = {
  transact: any
  params: any
}

type IState = {
  paramProps: Array<string>
}

export default (first: string|IMapTasks, ...rest: Array<string|IMapTasks>): IMapTasks => {
  let mapper: IMapTasks
  let paramNames: Array<string>
  
  // Task mapper is either the first and only argument, or it is the last.
  if (typeof first === 'function') {
    mapper = first
    paramNames = []
  } else {
    mapper = rest[rest.length - 1] as IMapTasks
    paramNames = [first].concat((rest as Array<string>).slice(0, rest.length - 1))
  }
  
  invariant(
    typeof mapper === 'function',
    '@transact.router called without a task mapper function as the last argument'
  )

  return (Wrappee: any): any => {
    const Inner = transact(mapper, { onMount: true })((props) =>
      React.createElement(
        Wrappee,
        props
      ))

    class Wrapped extends React.Component<IProps,IState> {
      static displayName = `TransactRoute(${getDisplayName(Wrappee)})`

      static _mapTasks = (state, props, commit) => mapper(state, toParamProps(paramNames, props), commit)

      static contextTypes = {
        router: React.PropTypes.any,
        transact: React.PropTypes.object
      }

      context: IProps

      _inner: any = null

      constructor(props, context) {
        super(props, context)
        this.state = {
          paramProps: toParamProps(paramNames, props)
        }
      }

      componentWillReceiveProps(nextProps) {
        const nextParamProps = toParamProps(paramNames, nextProps)
        if (!shallowEqual(this.state.paramProps, nextParamProps)) {
          this.setState({ paramProps: nextParamProps }, () => {
            this._inner.forceResolve()
          })
        }
      }
      
      render() {
        return React.createElement(
          Inner,
          Object.assign({
            ref: r => this._inner = r,
            children: this.props.children
          }, this.state.paramProps)
        )
      }
    }

    return Wrapped
  }
}

