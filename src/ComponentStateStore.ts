import { IStore, IAction } from './interfaces'

const INIT = { type: '@@INIT' }

/*
 * The `ComponentStateStore` can be used in place of redux store. When actions
 * are dispatched to the store, it will reduce down to a new component state.
 */
const ComponentStateStore = (reducer: (any, IAction)=>any, getState: ()=>any, setState: (any)=>void): IStore => {
  let r = reducer

  setTimeout(() => {
    setState(r(undefined, INIT))
  }, 0)

  return {
    dispatch: (action: IAction<any>) => {
      setState(r(getState(), action))
    },
    getState,
    replaceReducer: (reducer: (any, IAction)=>any): void => { r = reducer }
  }
}

export default ComponentStateStore
