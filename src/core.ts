import Task from './internals/Task'
import route from './decorators/route'
import _transact from './decorators/transact'
import taskCreator from './internals/taskCreator'
import TransactContext from './components/TransactContext'
import { call, tap, trace } from './effects'

const transact: any = _transact
transact.route = route

export {
  call,
  tap,
  trace,
  transact,
  route,
  taskCreator,
  Task,
  TransactContext
}

export default {
  call,
  tap,
  trace,
  transact,
  route,
  taskCreator,
  Task,
  TransactContext
}
