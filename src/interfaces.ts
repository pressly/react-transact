export interface IAction<T> {
  type: T
  payload?: any
}

export interface IActionThunk<A> {
  (action: IAction<A>): void
}

export interface IComputation<A,B> {
  (reject: IActionThunk<A>, resolve: IActionThunk<B>, progress?: IActionThunk<any>, cancel?: IActionThunk<any>): void
}

export interface ITask<A,B> {
  fork(rej: IActionThunk<A|B>, res: IActionThunk<B>, progress?: IActionThunk<any>, cancel?: IActionThunk<any>): void
  chain<A2,B2>(g: (arg: any) => ITask<A2,B2>): ITask<A|A2,B2>
}

export interface ITransaction {
  tasks: Array<ITask<any,any>>
}

export interface IChainTask<A,B,C,D> {
  (x: IAction<A|B>): ITask<C,D>
}

export interface ITaskCreator<A,B> {
  (a: A, b: B, f: Function): ITask<A,B>
}

export interface IMapTasks {
  (props: any): Array<ITask<any,any>> | ITask<any,any>
}

export type ITaskResult<A,B> = {
  task: ITask<A,B>
  result: A | B
  isRejected: boolean
}

export type IEffect<T> = (...args: any[]) => Promise<T> | T

export type TasksOrEffects = Array<ITask<any,any> | IEffect<any>> | ITask<any,any> | IEffect<any>

export interface IStore {
  dispatch: (action: IAction<any>) => void
  getState: () => any
  subscribe: (listener: () => void) => () => void
  replaceReducer: ((any, IAction) => void)
}

export type IResolveOptions = {
  immediate: boolean
}

export type IDecoratorOptions = {
  onMount?: boolean,
  trigger?: string
}

export type IRouterProps = {
  components: any[]
}
