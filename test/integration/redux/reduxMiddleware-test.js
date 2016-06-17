const test = require('tape')
const React = require('react')
const reduxMiddleware = require('../../../lib/adapters/redux/middleware').default
const applyMiddleware = require('redux').applyMiddleware
const actions = require('../../../lib/actions')
const Task = require('../../../lib/internals/Task').default
const ReduxTransactContext = require('../../../lib/adapters/redux/ReduxTransactContext').default
const transact = require('../../../lib/decorators/transact').default
const createStore = require('redux').createStore
const sinon = require('sinon')

test('reduxMiddleware (no tasks)', (t) => {
  const identity = (state) => state
  const m = reduxMiddleware()
  const store = createStore(identity, {}, applyMiddleware(m))

  t.ok(typeof m.done.then === 'function', 'returns a done promise on reduxMiddleware')

  store.dispatch({ type: actions.RUN_SCHEDULED_TASKS })

  m.done.then(() => {
    t.ok(true, 'resolves done promise')
    t.end()
  })
})

test('reduxMiddleware (run one task)', (t) => {
  const reducer = (state = '', action = {}) => {
    if (action.type === 'OK') return 'called'
    return state
  }
  const m = reduxMiddleware()
  const store = createStore(reducer, undefined, applyMiddleware(m))

  store.dispatch({ type: actions.SCHEDULE_TASKS, payload: [Task.resolve({ type: 'OK' })] })

  store.dispatch({ type: actions.RUN_SCHEDULED_TASKS })

  m.done.then((results) => {
    t.equal(store.getState(), 'called', 'state is updated before done resolves')
    t.equal(results.length, 1, 'results array is dispatched with `TASKS_RESOLVED` action')
    t.deepEqual(results[0].result, { type: 'OK' }, 'action is in results')
    t.end()
  })
})

test('reduxMiddleware middleware (multiple tasks)', (t) => {
  const reducer = (state = [], action = {}) => {
    if (action.type === 'OK' || action.type === actions.SCHEDULED_TASKS_PENDING || action.type === actions.SCHEDULED_TASKS_COMPLETED) {
      return state.concat([action])
    } else {
      return state
    }
  }
  const m = reduxMiddleware()
  const store = createStore(reducer, undefined, applyMiddleware(m))

  // This should resolve after all tasks are finished.
  m.done.then(() => {
    const state = store.getState()
    t.equals(state[0].type, actions.SCHEDULED_TASKS_PENDING)
    t.deepEqual(state.slice(1, 7), [
      { type: 'OK', payload: 1 },
      { type: 'OK', payload: 2 },
      { type: 'OK', payload: 3 },
      { type: 'OK', payload: 4 },
      { type: 'OK', payload: 5 },
      { type: 'OK', payload: 6 }
    ], 'waits for all tasks to resolve and dispatches their actions')
    t.equals(state[7].type, actions.SCHEDULED_TASKS_COMPLETED)
    t.end()
  })

  store.dispatch({ type: actions.SCHEDULE_TASKS, payload: [Task.resolve({ type: 'OK', payload: 1 })] })

  store.dispatch({ type: actions.RUN_SCHEDULED_TASKS })

  store.dispatch({ type: actions.SCHEDULE_TASKS, payload: [Task.resolve({ type: 'OK', payload: 2 })] })

  store.dispatch({ type: actions.RUN_SCHEDULED_TASKS })

  store.dispatch({ type: actions.SCHEDULE_TASKS, payload: [
    Task.resolve({ type: 'OK', payload: 3 }),
    Task.resolve({ type: 'OK', payload: 4 }),
    Task.resolve({ type: 'OK', payload: 5 })
  ]})

  store.dispatch({ type: actions.SCHEDULE_TASKS, payload: [Task.resolve({ type: 'OK', payload: 6 })] })

  store.dispatch({ type: actions.RUN_SCHEDULED_TASKS })
})

test('reduxMiddleware middleware (with routes)', (t) => {
  const h = React.createElement
  const reducer = (state = [], action = {}) => {
    if (action.type === 'OK') return state.concat([action])
    else return state
  }

  const WrappedA = transact(
    (state, props) => [
      Task.resolve({ type: 'OK', payload: 1 }),
      Task.resolve({ type: 'OK', payload: 2 })
    ]
  )(
    () => null
  )

  const WrappedB = transact(
    (state, props) => [
      Task.resolve({ type: 'OK', payload: 3 }),
      Task.resolve({ type: 'OK', payload: 4 })
    ]
  )(
    () => null
  )

  const routeComponent =
    h('div', { children: [
      WrappedA,
      WrappedB
    ]})

  const m = reduxMiddleware({ components: [routeComponent] })

  const store = createStore(reducer, undefined, applyMiddleware(m))

  m.done.then(() => {
    t.deepEqual(store.getState(), [
      { type: 'OK', payload: 1 },
      { type: 'OK', payload: 2 },
      { type: 'OK', payload: 3 },
      { type: 'OK', payload: 4 }
    ], 'resolves all initial tasks')
    t.end()
  })
})

test('reduxMiddleware middleware (returning task from action creator)', (t) => {
  const reducer = (state = '', action = {}) => {
    if (action.type === 'OK') return 'called'
    return state
  }
  const m = reduxMiddleware()
  const store = createStore(reducer, undefined, applyMiddleware(m))

  store.dispatch(Task.resolve({ type: 'OK' }))

  m.done.then((results) => {
    t.equal(store.getState(), 'called', 'state is updated before done resolves')
    t.equal(results.length, 1, 'results array is dispatched with `TASKS_RESOLVED` action')
    t.deepEqual(results[0].result, { type: 'OK' }, 'action is in results')
    t.end()
  })
})
