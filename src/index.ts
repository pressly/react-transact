import Task from './internals/Task'
import route from './decorators/route'
import _transact from './decorators/transact'
import taskCreator from './internals/taskCreator'
import ReduxTransactContext from './adapters/redux/ReduxTransactContext'
import middleware from './adapters/redux/middleware'
import {RUN_SCHEDULED_TASKS, SCHEDULE_TASKS, STANDALONE_INIT, SCHEDULED_TASKS_PENDING, SCHEDULED_TASKS_COMPLETED} from './actions'

const transact: any = _transact
transact.route = route

export {
  RUN_SCHEDULED_TASKS,
  SCHEDULE_TASKS,
  STANDALONE_INIT,
  SCHEDULED_TASKS_PENDING,
  SCHEDULED_TASKS_COMPLETED,
  transact,
  route,
  taskCreator,
  Task,
  ReduxTransactContext,
  middleware as reduxTransact
}

export default {
  RUN_SCHEDULED_TASKS,
  SCHEDULE_TASKS,
  STANDALONE_INIT,
  SCHEDULED_TASKS_PENDING,
  SCHEDULED_TASKS_COMPLETED,
  transact,
  route,
  taskCreator,
  Task,
  ReduxTransactContext,
  reduxTransact: middleware
}
