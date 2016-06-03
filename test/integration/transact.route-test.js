require('./../setup')
const mount = require('enzyme').mount
const applyMiddleware = require('redux').applyMiddleware
const createStore = require('redux').createStore
const Provider = require('react-redux').Provider
const React = require('react')
const test = require('tape')
const sinon = require('sinon')
const RunContext = require('../../lib/components/RunContext').default
const route = require('../../lib/decorators/route').default
const Task = require('../../lib/internals/Task').default
const taskCreator = require('../../lib/internals/taskCreator').default
const install = require('../../lib/install').default

const h = React.createElement

test('route decorator - with declarative params array', (t) => {
  const m = install()
  const store = makeStore({
    history: [],
    message: ''
  }, m)

  const SUT = route(['what'], (state, props) =>
    Task.resolve({ type: MESSAGE, payload: props.what })
  )(() => h('p'))

  const wrapper = mount(h(createRoot(SUT), { params: { what: 'hello' }, store }))

  m.done.then(() => {
    t.deepEqual(store.getState(), {
      message: 'hello',
      history: [
        { type: 'MESSAGE', payload: 'hello' }
      ]
    }, 'dispatches tasks mapped by route params')

    wrapper.setProps({ params: { what: 'bye' } })

    // Bumping to next tick to allow tasks to complete.
    setTimeout(() => {
      t.deepEqual(store.getState(), {
        message: 'bye',
        history: [
          { type: 'MESSAGE', payload: 'hello' },
          { type: 'MESSAGE', payload: 'bye' }
        ]
      }, 'dispatches tasks mapped by route params')
      t.end()
    }, 10)
  })
})

test('route decorator - with route descriptor', (t) => {
  const m = install()
  const store = makeStore({
    history: [],
    message: ''
  }, m)

  const SUT = route({
    params: ['what'],
    query: ['who']
  }, (state, { what, who }) =>
    Task.resolve({ type: MESSAGE, payload: `${what} ${who}` })
  )(() => h('p'))

  const wrapper = mount(h(createRoot(SUT), {
    params: { what: 'Hello' },
    query: { who: 'Alice' }
    , store }))

  m.done.then(() => {
    t.deepEqual(store.getState(), {
      message: 'Hello Alice',
      history: [
        { type: 'MESSAGE', payload: 'Hello Alice' }
      ]
    }, 'dispatches tasks mapped by route params')

    wrapper.setProps({ params: { what: 'Bye' }, query: { who: 'Bob' } })

    // Bumping to next tick to allow tasks to complete.
    setTimeout(() => {
      t.deepEqual(store.getState(), {
        message: 'Bye Bob',
        history: [
          { type: 'MESSAGE', payload: 'Hello Alice' },
          { type: 'MESSAGE', payload: 'Bye Bob' }
        ]
      }, 'dispatches tasks mapped by route params')
      t.end()
    }, 10)
  })
})

// Test helpers

const MESSAGE = 'MESSAGE'
const ERROR = 'ERROR'

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

const createRoot = Child => class extends React.Component {
  render() {
    // Simulated route params
    return (
      h('div', { children:
        h(Provider, { store: this.props.store, children:
          h(RunContext, { children:
            h(Child, {
              params: this.props.params,
              query: this.props.query,
              transact: { resolve: () => {} }
            })
          })
        })
      })
    )
  }
}
