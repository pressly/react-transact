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
const install = require('../../lib/install').default

const h = React.createElement
const noop = () => {}

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
    h('div', { children: [
      h(Wrapped, { transact: { resolve } }),
      h(Wrapped, { transact: { resolve } })
    ]})
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
    h('div', { children: [
      h(Wrapped, { transact: { resolve } })
    ]})
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
  const m = install()
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
      .map(({ payload: x, type }) => ({ type, payload: `${x} Alice` }))
    )
    // Then the resulting action from here will commit as well.
    .map(({ payload: x, type }) => ({ type, payload: `${x}!` }))
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
            h('div', { children: [
              h(Wrapped),
              this.state.showSecondWrappedElement ? h(WrappedRunOnMount) : null
            ]})
          )
        )
      )
    }
  }

  const element = h(Root)

  const wrapped = mount(element)

  m.done.then(() => {
    t.deepEqual(store.getState().history, [
      { type: MESSAGE, payload: 'Bye Alice' },
      { type: MESSAGE, payload: 'Hello Alice!' },
      { type: ERROR, payload: 'Boo-urns' },
      { type: MESSAGE, payload: 'Bye Alice!' }
    ], 'actions are dispatched in order')

    t.equal(wrapped.text(), 'Bye Alice!', 'text shows results of last dispatched action')

    t.end()
  })
})

test('transact decorator (warnings)', (t) => {
  const store = { dispatch: noop, getState: noop }
  const warn = sinon.spy(console, 'warn')
  const Foo = () => h('div')
  Foo.displayName = 'Foo'
  const Wrapped = transact(() => [])(Foo)
  class FakeRouterContext extends React.Component {
    getChildContext() {
      return { router: {} }
    }
    render() {
      return h(RunContext, { store }, this.props.children)
    }
  }
  FakeRouterContext.childContextTypes = {
    router: React.PropTypes.any
  }

  mount(h(FakeRouterContext, {}, h(Wrapped)))
  t.ok(warn.called, 'warns user if non-route handler @transact component is mounted without { onMount: true }')
  t.ok(/Foo/.test(warn.firstCall.args[0]), 'should include component name in warning message')
  warn.reset()

  const WrappedOnMount = transact(() => [], { onMount: true })(Foo)
  mount(h(FakeRouterContext, {}, h(WrappedOnMount)))
  t.ok(!warn.called, 'no warning if `onMount: true` is specified in options')
  warn.reset()

  const WrappedWithoutTasks = transact()(Foo)
  mount(h(FakeRouterContext, {}, h(WrappedWithoutTasks)))
  t.ok(!warn.called, 'no warning if @transact component has no tasks')

  warn.restore()
  t.end()
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
