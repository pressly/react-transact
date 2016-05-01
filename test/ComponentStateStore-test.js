const test = require('tape')
const ComponentStateStore = require('../lib/internals/ComponentStateStore').default

test('ComponentStateStore', (t) => {
  let state = {}
  const reducer = (state = { message: '?' }, action) => {
    if (action.type === 'MESSAGE') {
      return { message: action.payload }
    } else {
      return state
    }
  }
  const getState = () => state
  const setState = (s) => { state = s }
  const store = ComponentStateStore(
    reducer,
    getState,
    setState
  )

  store.dispatch({ type: 'MESSAGE', payload: 'Hello' })
  t.deepEqual(state, { message: 'Hello' }, 'dispatch updates state')

  t.equal(store.getState(), state, 'returns store state')

  store.replaceReducer((state) => {
    return state
  })
  store.dispatch({ type: 'MESSAGE', payload: 'Bye' })
  t.deepEqual(state, { message: 'Hello' }, 'replaces reducer')

  t.end()
})
