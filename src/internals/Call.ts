import {ITask, IEffect} from "../interfaces";

/*
 * Wraps a potentially effectful function inside the structure Call.
 * This allows testing against structures as opposed mocking side effects.
 */
export default class Call<T> implements ITask<T,T> {
  computation: IEffect<T> = null
  args: any[] = null

  constructor(computation: IEffect<T>, ...args: any[]) {
    this.computation = computation
    this.args = args
  }

  fork(callback, progress?, cancel?) {
    try {
      const a = this.computation(...this.args)
      if (a instanceof Promise) {
        a.then(c => callback(c), d => callback(d))
      } else {
        callback(a)
      }
    } catch (e) {
      callback(e)
    }
  }

  chain<U>(g: any): Call<any> {
    return new Call<any>(() => {
      return new Promise((res, rej) => {
        this.fork((x) => {
          try {
            const u = g(x)
            res(u)
          } catch (e) {
            rej(e)
          }
        })
      })
    })
  }
}
