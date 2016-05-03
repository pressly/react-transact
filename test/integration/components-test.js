require('./../setup')
const mount = require('enzyme').mount
const applyMiddleware = require('redux').applyMiddleware
const createStore = require('redux').createStore
const connect = require('react-redux').connect
const Provider = require('react-redux').Provider
const React = require('react')
const test = require('tape')
const sinon = require('sinon')
const RunContext = require('../../lib/components/RunContext').default
const transact = require('../../lib/components/transact').default
const Task = require('../../lib/internals/Task').default
const taskCreator = require('../../lib/internals/taskCreator').default
const middleware = require('../../lib/middleware').default

const h = React.createElement

test('transact decorator (empty)', (t) => {
  const resolve = () => {}
  const factory = transact((state, props) => [])

  t.ok(typeof factory === 'function', 'returns a higher-order component')

  const Wrapped = factory(Greeter)

  t.ok(typeof Wrapped.displayName === 'string', 'returns a React component')

  const result = mount(
    h(Wrapped, {
      transact: { resolve },
      name: 'Alice'
    })
  )

  t.ok(result.find('.message').length > 0)
  t.equal(result.find('.message').text(), 'Hello Alice!')

  // Guards
  t.throws(() => {
    mount(
      h(Wrapped, {
        transact: null,
        name: 'Alice'
      })
    )
  }, /RunContext/, 'transact must be present in context')

  t.end()
})

test('transact decorator (with tasks)', (t) => {
  const resolve = sinon.spy()
  const Empty = () => h('p')
  const mapTasks = (state, props) => [
    Task.resolve({ type: 'GOOD', payload: 42 })
  ]

  const Wrapped = transact(mapTasks)(Empty)

  mount(
    h('div', {}, [
      h(Wrapped, { transact: { resolve } }),
      h(Wrapped, { transact: { resolve } })
    ])
  )

  t.equal(resolve.callCount, 2, 'calls resolve for each @transact component')
  t.equal(resolve.firstCall.args[0].mapper, mapTasks, 'calls resolve with task run mapper')
  t.equal(resolve.secondCall.args[0].mapper, mapTasks, 'calls resolve with task run mapper')

  t.end()
})

test('transact decorator (run on mount)', (t) => {
  const resolve = sinon.spy()
  const Empty = () => h('p')
  const mapTasks = (state, props) => [
    Task.resolve({ type: 'GOOD', payload: 42 })
  ]

  const Wrapped = transact(mapTasks, { onMount: true })(Empty)

  mount(
    h('div', {}, [
      h(Wrapped, { transact: { resolve } })
    ])
  )

  t.equal(resolve.firstCall.args[0].mapper, mapTasks, 'calls resolve with task run mapper')
  t.deepEqual(resolve.firstCall.args[1], { immediate: true }, 'enables immediate flag')

  t.end()
})

/*
 * This test covers all of the basic usages of @transact decorator. It is pretty long,
 * but is more of a journey test than integration. :)
 */
test('RunContext with transact decorator', (t) => {
  const m = middleware()
  const store = makeStore({
    history: [],
    message: ''
  }, m)
  const Message = ({ message }) => h('p', {}, [ message ])

  const Wrapped = transact(
    (state, props) => [
      Task.resolve({ type: MESSAGE, payload: 'Hello Alice!' }),
      taskCreator(ERROR, MESSAGE, () => new Promise((res, rej) => {
        setTimeout(() => {
          rej('Boo-urns')
        }, 10)
      }))()
    ]
  )(
    connect((state) => ({ message: state.message }))(
      Message
    )
  )

  // This component will not be mounted until `showSecondWrappedElement` is set to true.
  const WrappedRunOnMount = transact((state, props, commit) => [
    // Commits the resulting action from here first.
    commit(
      Task.resolve({ type: MESSAGE, payload: 'Bye' })
      .map(x => `${x} Alice`)
    )
    // Then the resulting action from here will commit as well.
    .map(x => `${x}!`)
  ], { onMount: true })(
    () => null
  )

  class Root extends React.Component {
    constructor(props) {
      super(props)
      this.state = { showSecondWrappedElement: false }
    }
    componentDidMount() {
      this.setState({ showSecondWrappedElement: true })
    }
    render() {
      return (
        h(Provider, { store },
          h(RunContext, {},
            h('div', {}, [
              h(Wrapped),
              this.state.showSecondWrappedElement ? h(WrappedRunOnMount) : null
            ])
          )
        )
      )
    }
  }

  const element = h(Root)

  const wrapped = mount(element)

  m.done.then(() => {
    t.deepEqual(store.getState().history, [
      { type: MESSAGE, payload: 'Hello Alice!' },
      { type: MESSAGE, payload: 'Bye Alice' },
      { type: MESSAGE, payload: 'Bye Alice!' },
      { type: ERROR, payload: 'Boo-urns' }
    ], 'actions are dispatched in order')

    t.equal(wrapped.text(), 'Hello Error!', 'text shows results of last dispatched action')

    t.end()
  })
})

const MESSAGE = 'MESSAGE'
const ERROR = 'ERROR'

const Greeter = ({ name }) => h('p', {
  className: 'message'
}, [`Hello ${name}!`])

const makeStore = (initialState = {}, m) => createStore((state = {}, action) => {
  switch (action.type) {
    case MESSAGE:
      return { message: action.payload, history: state.history.concat([action]) }
    case ERROR:
      return { message: 'Hello Error!', history: state.history.concat([action]) }
    default:
      return state
  }
}, initialState, applyMiddleware(m))
