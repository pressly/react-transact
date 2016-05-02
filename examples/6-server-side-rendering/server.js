const express = require('express')
const React = require('react')
const ReactDOM = require('react-dom/server')
const ReactTransact = require('../../index')
const { transact, Task, RunContext } = ReactTransact
const h = React.createElement

const server = express()

const App = transact(
  () => Task.resolve({ type: 'HELLO' }),
  { onMount: true }
)(
  ({ state }) => {
    const e = h('h1', {}, state.message)
    console.log(e)
    return e;
  }
)

const stateReducer = (state , action) => {
  if (action.type === 'HELLO') return { message: 'Hello World!' }
  else return state || { message: '' }
}

server.listen(8080, () => {
  server.all('/', (req, res) => {
    const documentElement = h(RunContext, {
      stateReducer,
      onResolve: () => {
        res.send(`<!doctype html>\n${markup}`)
      }
    }, h(App))
    const markup = ReactDOM.renderToStaticMarkup(documentElement)
  })
})
