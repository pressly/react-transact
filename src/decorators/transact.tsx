import * as React from 'react'
import { IMapTasks, IDecoratorOptions, MapperWithProps, IResolveOptions } from '../interfaces'
import { invariant, getDisplayName } from '../internals/helpers'

type ITransact = {
  resolve: (mapper: MapperWithProps, opts: IResolveOptions) => void
  run: (mapper: MapperWithProps, props: any) => void
  store: any
}

type IProps = {
  transact: ITransact
}

const defaultOpts = {
  onMount: false
}

export default (mapTasks: IMapTasks, opts: IDecoratorOptions = defaultOpts): Function => {
  return (Wrappee: any): any => {
    class Wrapped extends React.Component<IProps,void> {
      // For router context
      static _mapTasks = mapTasks
      static displayName = `Transact(${getDisplayName(Wrappee)})`
      static contextTypes = {
        router: React.PropTypes.any,
        transact: React.PropTypes.object
      }

      context: IProps
      transact: ITransact

      constructor(props, context) {
        super(props, context)
        this.transact = context.transact || props.transact

        invariant(
          this.transact !== null && this.transact !== undefined,
          'Cannot find `transact` from context or props. Perhaps you forgot to mount `RunContext` as a parent?'
        )

        if (typeof mapTasks === 'function') {
          this.transact.resolve({ props, mapper: mapTasks }, { immediate: opts.onMount })
        }

        if (typeof mapTasks === 'function' && context.router && !props.routeParams && !opts.onMount) {
          console.warn(
            `${Wrapped.displayName} is mounted in a router context, but is not a route handler. This can cause data loading issues on route change. You may want to add \`@transact(..., { onMount: true })\`.`
          )
        }
      }

      // Internal helper to force tasks to be resolved.
      forceResolve() {
        this.transact.resolve({
          props: this.props,
          mapper: mapTasks
        }, { immediate: true })
      }

      render() {
        return React.createElement(
          Wrappee,
          Object.assign({}, this.props, {
            transact: this.transact
          })
        )
      }
    }

    return Wrapped
  }
}
