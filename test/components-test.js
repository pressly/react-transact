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

test('transact decorator (empty)', (t) => {
  const resolve = () => {}
  const factory = transact((state, props) => [])

  t.ok(typeof factory === 'function', 'returns a higher-order component')

  const Wrapped = factory(Greeter)

  t.ok(typeof Wrapped.displayName === 'string', 'returns a React component')

  const result = mount(
    React.createElement(Wrapped, {
      resolve,
      name: 'Alice'
    })
  )

  t.ok(result.find('.message').length > 0)
  t.equal(result.find('.message').text(), 'Hello Alice!')

  t.end()
})

test('transact decorator (with tasks)', (t) => {
  const resolve = sinon.spy()
  const Empty = () => React.createElement('p')
  const mapTasks = (state, props) => [
    Task.resolve({ type: 'GOOD', payload: 42 })
  ]

  const Wrapped = transact(mapTasks)(Empty)

  mount(
    React.createElement('div', {}, [
      React.createElement(Wrapped, { resolve }),
      React.createElement(Wrapped, { resolve })
    ])
  )

  t.equal(resolve.callCount, 2, 'calls resolve for each @transact component')
  t.equal(resolve.firstCall.args[0], mapTasks, 'calls resolve with task run mapper')
  t.equal(resolve.secondCall.args[0], mapTasks, 'calls resolve with task run mapper')

  t.end()
})

test('RunContext with transact decorator (integration)', (t) => {
  const store = makeStore({
    message: ''
  })
  const dispatchSpy = sinon.spy(store, 'dispatch')
  const Message = ({ message }) => React.createElement('p', {}, [ message ])
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

  const wrapper = mount(
    React.createElement(Provider, { store },
      React.createElement(RunContext, {
          onResolve: (failedTasks) => {
            t.equal(failedTasks.length, 1, 'resolves with failed tasks')
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

            t.end()
          }
        },
        React.createElement(Wrapped)
      )
    )
  )
})

const MESSAGE = 'MESSAGE'
const ERROR = 'ERROR'

const Greeter = ({ name }) => React.createElement('p', {
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