require('../setup')
const mount = require('enzyme').mount
const React = require('react')
const test = require('tape')
const sinon = require('sinon')
const TransactContext = require('../../lib/components/TransactContext').default
const transact = require('../../lib/decorators/transact').default
const Task = require('../../lib/internals/Task').default
const taskCreator = require('../../lib/internals/taskCreator').default

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
  }, /TransactContext/, 'transact must be present in context')

  t.end()
})

test('transact decorator (with tasks)', (t) => {
  const resolve = sinon.spy()
  const Empty = () => h('p')
  const tasks = [
    Task.resolve({ type: 'GOOD', payload: 42 })
  ]

  const Wrapped = transact(() => tasks)(Empty)

  mount(
    h('div', { children: [
      h(Wrapped, { transact: { resolve } }),
      h(Wrapped, { transact: { resolve } })
    ]})
  )

  t.equal(resolve.callCount, 2, 'calls resolve for each @transact component')
  t.equal(resolve.firstCall.args[0], tasks, 'calls resolve with task run mapper')
  t.equal(resolve.secondCall.args[0], tasks, 'calls resolve with task run mapper')

  t.end()
})

test('transact decorator (run on mount)', (t) => {
  const resolve = sinon.spy()
  const Empty = () => h('p')
  const tasks = [
    Task.resolve({ type: 'GOOD', payload: 42 })
  ]

  const Wrapped = transact(() => tasks, { onMount: true })(Empty)

  mount(
    h('div', { children: [
      h(Wrapped, { transact: { resolve } })
    ]})
  )

  t.equal(resolve.firstCall.args[0], tasks, 'calls resolve with task run mapper')
  t.deepEqual(resolve.firstCall.args[1], { immediate: true }, 'enables immediate flag')

  t.end()
})

const effect = (fn) => new Task((__, res) => fn(res))

test('TransactContext with transact decorator', (t) => {
  const Message = ({ message }) => {
    return h('p', {}, [ message ])
  }

  const Wrapped = transact(
    (props) => {
      return  [
        effect((next) => {
          props.onMessageChange('Hello Alice!')
          next()
        }),
        effect((next) => {
          setTimeout(() => {
            props.onMessageChange('Bye Alice!')
            next()
          }, 10)
        })
      ]
    }
  )(Message)

  class Root extends React.Component {
    constructor(props) {
      super(props)
      this.state = { message: '' }
      this.messages = []
    }
    onMessageChange(message) {
      this.messages.push(message)
      this.setState({ message })
    }
    render() {
      return (
        h(TransactContext, { onReady: () => {
            t.deepEqual(this.messages, [
              'Hello Alice!',
              'Bye Alice!'
            ], 'receives both messages')

            t.equal(wrapped.text(), 'Bye Alice!', 'text shows results of last dispatched action')

            t.end()
          } },
          h('div', { children: [
            h(Wrapped, {
              message: this.state.message,
              onMessageChange: this.onMessageChange.bind(this)
            })
          ]})
        )
      )
    }
  }

  const wrapped = mount(h(Root))
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
      return h(TransactContext, { store }, this.props.children)
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
