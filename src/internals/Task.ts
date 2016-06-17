import {IAction, IActionThunk, IComputation, ITask, ITaskCreator, IChainTask} from './../interfaces'

class Task<A,B> implements ITask<A,B> {
  computation: IComputation<A,B>
  cleanup: Function

  static resolve<B>(action: IAction<B>): ITask<any,B> {
    return new Task((__: IActionThunk<any>, res: IActionThunk<B>) => {
      res(action)
    })
  }

  static reject<A>(action: IAction<A>): ITask<A,any> {
    return new Task((rej: IActionThunk<A>, __: IActionThunk<any>) => {
      rej(action)
    })
  }

  /*
   * An empty task that will never resolve.
   */
  static empty(): ITask<any,any> {
    return new Task((__: IActionThunk<any>, ___: IActionThunk<any>) => {})
  }

  /*
   * When given a function and a task, returns a task that when forked will
   * first apply the returned action (either A or B) the supplied function.
   * The resulting action is then chained.
   */
  static tap<A,B>(fn: Function) {
    return (task: ITask<A,B>): ITask<A,B> => {
      return new Task((rej:IActionThunk<A>, res:IActionThunk<B>) => {
        task.fork(
          (a:IAction<A>) => {
            fn(this, a, true)
            rej(a)
          },
          (b:IAction<B>) => {
            fn(this, b, false)
            res(b)
          }
        )
      })
    }
  }

  constructor(computation: IComputation<A,B>, cleanup: Function = () => {}) {
    this.computation = computation
    this.cleanup = cleanup
  }

  fork(rej: IActionThunk<A|B>, res: IActionThunk<B>, progress?: IActionThunk<any>, cancel?: IActionThunk<any>): void {
    this.computation(
      (a: IAction<A>): void => rej(a),
      (b: IAction<B>): void => res(b),
      (c: IAction<any>): void => progress(c),
      (d: IAction<any>): void => cancel(d)
    )
  }

  chain<A2,B2>(g: (arg: IAction<A|B>)=> ITask<A2,B2>): ITask<A|A2,B2> {
    return new Task((rej: IActionThunk<A|A2>, res: IActionThunk<B2>) => {
      this.fork(
        (action: IAction<A>) => {
          rej(action)
        },
        (action: IAction<B>) => {
          g(action).fork(
            (action: IAction<A2>) => rej(action),
            (action: IAction<B2>) => res(action)
          )
        }
      )
    })
  }

  map(g: (arg: IAction<A|B>)=> any): ITask<A,B> {
    return new Task((rej: IActionThunk<A>, res: IActionThunk<B>) => {
      this.fork(
        (action: IAction<A>) => rej(action),
        (action: IAction<B>) => {
          const valueOrPromise = g(action)
          if (typeof valueOrPromise.then === 'function') {
            valueOrPromise.then((value) => {
              res(value)
            })
          } else {
            res(valueOrPromise)
          }
        }
      )
    })
  }

  orElse<A2,B2>(f: IChainTask<A,B,A2,B2>): ITask<A2,B|B2> {
    return new Task<A2,B2>((rej: IActionThunk<A2>, res: IActionThunk<B|B2>) => {
      return this.fork(
        (action: IAction<A>) => {
          f(action).fork(rej, res)
        },
        (action: IAction<B>) => {
          res(action)
        }
      )
    })
  }

  cancel(): void {
    this.cleanup()
    this.computation = () => {}
  }
}

export default Task
