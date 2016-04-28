export interface IAction<T> {
  type: T
  payload?: any
}

export interface IActionThunk<A> {
  (action: IAction<A>): void
}

export interface IComputation<A,B> {
  (reject: IActionThunk<A>, resolve: IActionThunk<B>): void
}

export interface ITask<A,B> {
  computation: IComputation<A,B>
  fork(rejOrCombined: IActionThunk<A|B>, res?: IActionThunk<B>): void
  chain<A2,B2>(g: (arg: any) => ITask<A2,B2>): ITask<A|A2,B2>
}

export interface ITaskCreator<A,B> {
  (a: A, b: B, f: Function): ITask<A,B>
}

export interface IMapTasks {
  (state: any, props: any): Array<ITask<any,any>>
}

export interface IStore {
  dispatch: (action: IAction<any>) => void
  subscribe: (f: Function) => () => void
  getState: ()=> any
}