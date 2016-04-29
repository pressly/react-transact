import * as React from 'react'
import { IMapTasks, IDecoratorOptions, IResolveOptions } from './../interfaces'

const getDisplayName = (C: any): string => C.displayName || C.name || 'Component'

type IProps = {
  resolve: (IMapTasks)=> void
}

const defaultOpts = {
  onMount: false
}

export default (opts: IDecoratorOptions = defaultOpts) => (mapTasks: IMapTasks): Function => {
  return (Wrappee: any): any => {
    class Wrapped extends React.Component<IProps,void> {
      static displayName = `Dispatches(${getDisplayName(Wrappee)})`
      static contextTypes = {
        resolve: React.PropTypes.func.isRequired
      }

      context: IProps
      resolve: (IMapTaskRuns, IResolveOptions) => void

      constructor(props, context) {
        super(props, context)
        this.resolve = context.resolve || props.resolve
        if (typeof this.resolve !== 'function') {
          throw new Error('Cannot find function `resolve` from context or props. Perhaps you forgot to mount `RunContext` as a parent?')
        }
        this.resolve(mapTasks, { immediate: opts.onMount })
      }

      render() {
        return React.createElement(Wrappee, Object.assign({}, this.props, { resolve: this.resolve }))
      }
    }

    return Wrapped
  }
}
