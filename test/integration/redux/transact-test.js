require('./../../setup')
const mount = require('enzyme').mount
const applyMiddleware = require('redux').applyMiddleware
const createStore = require('redux').createStore
const connect = require('react-redux').connect
const Provider = require('react-redux').Provider
const React = require('react')
const test = require('tape')
const sinon = require('sinon')
const ReduxTransactContext = require('../../../lib/adapters/redux/ReduxTransactContext').default
const transact = require('../../../lib/decorators/transact').default
const Task = require('../../../lib/internals/Task').default
const taskCreator = require('../../../lib/internals/taskCreator').default
const reduxMiddleware = require('../../../lib/adapters/redux/middleware').default

const h = React.createElement
const noop = () => {}

/*
 * This test covers all of the basic usages of @transact decorator. It is pretty long,
 * but is more of a journey test than integration. :)
 */
test('ReduxTransactContext with transact decorator', (t) => {
  const m = reduxMiddleware()
  const store = makeStore({
    history: [],
    message: ''
  }, m)
  const Message = ({ message }) => h('p', {}, [ message ])

  const Wrapped = transact(
    (props) => [
      Task.resolve({ type: MESSAGE, payload: 'Hello Alice!' }),
      // Delayed task should still resolve in order
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
  const WrappedRunOnMount = transact((props) => [
    Task.resolve({ type: MESSAGE, payload: 'Bye Alice' })
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
          h(ReduxTransactContext, {},
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
      { type: MESSAGE, payload: 'Hello Alice!' },
      { type: ERROR, payload: 'Boo-urns' },
      { type: MESSAGE, payload: 'Bye Alice' }
    ], 'actions are dispatched in order')

    t.equal(wrapped.text(), 'Bye Alice', 'text shows results of last dispatched action')

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
      return h(ReduxTransactContext, { store }, this.props.children)
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

// Test helpers

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
