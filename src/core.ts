import Task from './internals/Task'
import resolve from './internals/resolve'
import route from './decorators/route'
import _transact from './decorators/transact'
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
  Task,
  resolve,
  TransactContext
}

export default {
  call,
  tap,
  trace,
  transact,
  route,
  Task,
  resolve,
  TransactContext
}
