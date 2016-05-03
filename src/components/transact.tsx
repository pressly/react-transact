import * as React from 'react'
import { IMapTasks, IDecoratorOptions, ITask, MapperWithProps, IResolveOptions } from './../interfaces'

const getDisplayName = (C: any): string => C.displayName || C.name || 'Component'

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
        transact: React.PropTypes.object
      }

      context: IProps
      transact: ITransact

      constructor(props, context) {
        super(props, context)
        this.transact = context.transact || props.transact
        if (this.transact === null || this.transact === undefined) {
          throw new Error('Cannot find `transact` from context or props. Perhaps you forgot to mount `RunContext` as a parent?')
        }
        if (typeof mapTasks === 'function') {
          this.transact.resolve({ props, mapper: mapTasks }, { immediate: opts.onMount })
        }
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
