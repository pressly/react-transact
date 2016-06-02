import Task from './internals/Task'
import route from './components/route'
import _transact from './components/transact'
import taskCreator from './internals/taskCreator'
import RunContext from './components/RunContext'
import RouterRunContext from './components/RouterRunContext'
import install from './install'
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
  RunContext,
  RouterRunContext,
  install
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
  RunContext,
  RouterRunContext,
  install
}
