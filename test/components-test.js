require('./setup')
const mount = require('enzyme').mount
const createStore = require('redux').createStore
const connect = require('react-redux').connect
const Provider = require('react-redux').Provider
const React = require('react')
const test = require('tape')
const sinon = require('sinon')
const RunContext = require('../index').RunContext
const transact = require('../index').transact
const Task = require('../index').Task
const taskCreator = require('../index').taskCreator

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
  t.equal(resolve.firstCall.args[0], mapTasks, 'calls resolve with task run mapper')
  t.equal(resolve.secondCall.args[0], mapTasks, 'calls resolve with task run mapper')

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

  t.equal(resolve.firstCall.args[0], mapTasks, 'calls resolve with task run mapper')
  t.deepEqual(resolve.firstCall.args[1], { immediate: true }, 'enables immediate flag')

  t.end()
})

test('RunContext with transact decorator (integration)', (t) => {
  const store = makeStore({
    message: ''
  })
  const dispatchSpy = sinon.spy(store, 'dispatch')
  const Message = ({ message }) => h('p', {}, [ message ])
  const mapTasks = (state, props) => [
    Task.resolve({ type: MESSAGE, payload: 'Hello Alice!' }),
    taskCreator(ERROR, MESSAGE, () => new Promise((res, rej) => {
      setTimeout(() => {
        rej('Boo-urns')
      }, 10)
    }))()
  ]

  const Wrapped = transact(mapTasks)(
    connect((state) => ({ message: state.message }))(
      Message
    )
  )

  const WrappedRunOnMount = transact(() => [
    Task.resolve({ type: MESSAGE, payload: 'Bye!' })
  ], { onMount: true })(
    connect((state) => ({ message: state.message }))(
      Message
    )
  )

  class Root extends React.Component {
    constructor(props) {
      super(props)
      this.state = { showSecondWrappedElement: false }
    }
    render() {
      return (
        h(Provider, { store },
          h(RunContext, {
              onResolve: (results) => {
                if (!this.state.showSecondWrappedElement) {
                  // This is the first time onResolve is called, which should only dispatch
                  // the Wrapped component.
                  t.equal(results.length, 2, 'resolves with results of tasks')
                  t.equal(wrapper.text(), 'Hello Error!', 'updates state after task completion')

                  t.equal(dispatchSpy.callCount, 2)

                  t.deepEqual(dispatchSpy.firstCall.args[0], {
                    type: MESSAGE,
                    payload: 'Hello Alice!'
                  }, 'dispatches first action')

                  t.deepEqual(dispatchSpy.secondCall.args[0], {
                    type: ERROR,
                    payload: 'Boo-urns'
                  }, 'dispatches second action')

                  // Now show the second `onMount: true` element
                  this.setState({ showSecondWrappedElement: true })
                } else {
                  // This is the second time the onResolve is called, which is caused by
                  // the WrappedRunOnMount being mounted with `transact(..., { onMount: true })`.
                  t.equal(dispatchSpy.callCount, 3)
                  t.deepEqual(dispatchSpy.thirdCall.args[0], {
                    type: MESSAGE,
                    payload: 'Bye!'
                  }, 'supports dispatches on mount')
                  t.end()
                }
              }
            },
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

  const wrapper = mount(element)
})

const MESSAGE = 'MESSAGE'
const ERROR = 'ERROR'

const Greeter = ({ name }) => h('p', {
  className: 'message'
}, [`Hello ${name}!`])

const makeStore = (initialState = {}) => createStore((state = {}, action) => {
  switch (action.type) {
    case MESSAGE:
      return { message: action.payload }
    case ERROR:
      return { message: 'Hello Error!', prev: state.message }
    default:
      return state
  }
}, initialState)