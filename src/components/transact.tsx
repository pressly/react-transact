import * as React from 'react'
import { IMapTasks } from './../interfaces'

const getDisplayName = (C: any): string => C.displayName || C.name || 'Component'

type IProps = {
  resolve: (IMapTasks)=> void
}

export default (mapTasks: IMapTasks): Function => {
  return (Wrappee: any): any => {
    class Wrapped extends React.Component<IProps,void> {
      static displayName = `Dispatches(${getDisplayName(Wrappee)})`
      static contextTypes = {
        resolve: React.PropTypes.func
      }

      context: IProps
      resolve: (IMapTaskRuns) => void

      constructor(props, context) {
        super(props, context)
        this.resolve = context.resolve || props.resolve
        this.resolve(mapTasks)
      }

      render() {
        return React.createElement(Wrappee, this.props)
      }
    }

    return Wrapped
  }
}
