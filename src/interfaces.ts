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

export interface IChainTask<A,B> {
  (x: any): ITask<A,B>
}

export interface ITaskCreator<A,B> {
  (a: A, b: B, f: Function): ITask<A,B>
}

export interface IMapTasks {
  (state: any, props: any, commit: IChainTask<any,any>): Array<ITask<any,any>> | ITask<any,any>
}

export type MapperWithProps = {
  props: any,
  mapper: IMapTasks
}

export interface IStore {
  dispatch: (action: IAction<any>) => void
  getState: () => any
  replaceReducer: ((any, IAction) => void)
}

export type IResolveOptions = {
  immediate: boolean
}

export type IDecoratorOptions = {
  onMount: boolean
}
