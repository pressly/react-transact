import route from './decorators/route'
import _transact from './decorators/transact'
import ReduxTransactContext from './adapters/redux/ReduxTransactContext'
import middleware from './adapters/redux/middleware'
import {RUN_SCHEDULED_TASKS, SCHEDULE_TASKS, STANDALONE_INIT, SCHEDULED_TASKS_PENDING, SCHEDULED_TASKS_COMPLETED} from './actions'
import taskCreator from './internals/taskCreator'

const transact: any = _transact
transact.route = route

export {
  RUN_SCHEDULED_TASKS,
  SCHEDULE_TASKS,
  STANDALONE_INIT,
  SCHEDULED_TASKS_PENDING,
  SCHEDULED_TASKS_COMPLETED,
  taskCreator,
  ReduxTransactContext,
  middleware as reduxTransact
}

export default {
  RUN_SCHEDULED_TASKS,
  SCHEDULE_TASKS,
  STANDALONE_INIT,
  SCHEDULED_TASKS_PENDING,
  SCHEDULED_TASKS_COMPLETED,
  taskCreator,
  ReduxTransactContext,
  reduxTransact: middleware
}
