import {IStore, IAction} from '../interfaces'
import {STANDALONE_INIT} from '../actions'
import install from '../install'

const middleware = install(null)

/*
 * The `ComponentStateStore` can be used in place of redux store. When actions
 * are dispatched to the store, it will reduce down to a new component state.
 */
const ComponentStateStore = (reducer: (any, IAction)=>any, getState: ()=>any, setState: (any)=>void): IStore => {
  let r = reducer

  setTimeout(() => {
    r(undefined, STANDALONE_INIT)
  }, 0)

  const dispatch = (action: IAction<any>) => {
    setState(r(getState(), action))
  }

  const store = {
    dispatch: (action: IAction<any>) => {
      middleware(store)((action) => {
        dispatch(action)
      })(action)
    },
    getState,
    subscribe: () => {
      return () => {}
    },
    replaceReducer: (reducer: (any, IAction)=>any): void => { r = reducer }
  }


  return store
}

export default ComponentStateStore
