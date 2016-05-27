import { IActionThunk, ITaskCreator } from './../interfaces'
import Task from './Task'

export default <A,B>(rejectType: A, resolveType: B, arg3: any, arg4: any): ITaskCreator<A,B> => {
  return (...args: any[]) =>
    new Task((rej: IActionThunk<A>, res: IActionThunk<B>, progress?: IActionThunk<any>, cancel?: IActionThunk<any>) => {
      try {
        const fn = typeof arg3 === 'function' ? arg3 : arg4
        const progressType = typeof arg3 !== 'function' ? arg3 : null

        if (progressType !== null) {
          progress({ type: progressType })
        }

        const promiseOrValue = fn(...args)

        if (typeof promiseOrValue.then === 'function') {
          promiseOrValue.then(
            (value: any) => res({ type: resolveType, payload: value }),
            (err: any) => rej({ type: rejectType, payload: err })
          )
        } else {
          res({ type: resolveType, payload: promiseOrValue })
        }
      } catch (err) {
        rej({ type: rejectType, payload: err })
      }
    })
}
