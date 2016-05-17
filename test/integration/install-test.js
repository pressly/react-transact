const test = require('tape')
const React = require('react')
const install = require('../../lib/install').default
const applyMiddleware = require('redux').applyMiddleware
const actions = require('../../lib/actions')
const Task = require('../../lib/internals/Task').default
const RunContext = require('../../lib/components/RunContext').default
const transact = require('../../lib/components/transact').default
const createStore = require('redux').createStore
const sinon = require('sinon')

test('install middleware (no tasks)', (t) => {
  const identity = (state) => state
  const m = install()
  const store = createStore(identity, {}, applyMiddleware(m))

  t.ok(typeof m.done.then === 'function', 'returns a done promise on install')

  store.dispatch({ type: actions.RUN_SCHEDULED_TASKS })

  m.done.then(() => {
    t.ok(true, 'resolves done promise')
    t.end()
  })
})

test('install middleware (run one task)', (t) => {
  let results = null
  const reducer = (state = '', action = {}) => {
    if (action.type === 'OK') return 'called'
    if (action.type === actions.TASKS_RESOLVED) {
      results = action.payload
    }
    return state
  }
  const m = install()
  const store = createStore(reducer, undefined, applyMiddleware(m))

  store.dispatch({ type: actions.SCHEDULE_TASKS, payload: {
    mapper: () => [Task.resolve({ type: 'OK' })],
    props: {}
  } })

  store.dispatch({ type: actions.RUN_SCHEDULED_TASKS })

  m.done.then(() => {
    t.equal(store.getState(), 'called', 'state is updated before done resolves')
    t.equal(results.length, 1, 'results array is dispatched with `TASKS_RESOLVED` action')
    t.deepEqual(results[0].action, { type: 'OK' }, 'action is in results')
    t.end()
  })
})

test('install middleware (multiple tasks)', (t) => {
  const reducer = (state = [], action = {}) => {
    if (action.type === 'OK') return state.concat([action])
    else return state
  }
  const m = install()
  const store = createStore(reducer, undefined, applyMiddleware(m))

  // This should resolve after all tasks are finished.
  m.done.then(() => {
    t.deepEqual(store.getState(), [
      { type: 'OK', payload: 1 },
      { type: 'OK', payload: 2 },
      { type: 'OK', payload: 3 },
      { type: 'OK', payload: 4 },
      { type: 'OK', payload: 5 },
      { type: 'OK', payload: 6 }
    ], 'waits for all tasks to resolve and dispatches their actions')
    t.end()
  })

  store.dispatch({ type: actions.SCHEDULE_TASKS, payload: {
    mapper: () => [Task.resolve({ type: 'OK', payload: 1 })],
    props: {}
  } })

  store.dispatch({ type: actions.RUN_SCHEDULED_TASKS })

  store.dispatch({ type: actions.SCHEDULE_TASKS, payload: {
    mapper: () => [Task.resolve({ type: 'OK', payload: 2 })],
    props: {}
  } })

  store.dispatch({ type: actions.RUN_SCHEDULED_TASKS })

  store.dispatch({ type: actions.SCHEDULE_TASKS, payload: {
    mapper: () => [
      Task.resolve({ type: 'OK', payload: 3 }),
      Task.resolve({ type: 'OK', payload: 4 }),
      Task.resolve({ type: 'OK', payload: 5 })
    ],
    props: {}
  } })

  store.dispatch({ type: actions.SCHEDULE_TASKS, payload: {
    mapper: () => [Task.resolve({ type: 'OK', payload: 6 })],
    props: {}
  } })

  store.dispatch({ type: actions.RUN_SCHEDULED_TASKS })
})

test('install middleware (with routes)', (t) => {
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

  const m = install({ components: [routeComponent] })

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

test('install middleware (returning task from action creator)', (t) => {
  let results = null
  const reducer = (state = '', action = {}) => {
    if (action.type === 'OK') return 'called'
    if (action.type === actions.TASKS_RESOLVED) {
      results = action.payload
    }
    return state
  }
  const m = install()
  const store = createStore(reducer, undefined, applyMiddleware(m))

  store.dispatch(Task.resolve({ type: 'OK' }))

  m.done.then(() => {
    t.equal(store.getState(), 'called', 'state is updated before done resolves')
    t.equal(results.length, 1, 'results array is dispatched with `TASKS_RESOLVED` action')
    t.deepEqual(results[0].action, { type: 'OK' }, 'action is in results')
    t.end()
  })
})
