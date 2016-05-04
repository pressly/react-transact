import express from 'express'
import React from 'react'
import ReactDOM from 'react-dom/server'
import {Route, match} from 'react-router'
import {Provider, connect} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import {transact, taskCreator, RouterRunContext, install} from '../../index'

const server = express()

const reducer = (state = { message: '' }, action) => {
  if (action.type === 'APPEND') return { ...state, message: `${state.message}${action.payload}` }
  if (action.type === 'COLOR') return { ...state, color: action.payload }
  else return state
}

/*
 * Task creators that will be scheduled and run by the middleware.
 */
const appendText = taskCreator('ERROR', 'APPEND', (s) => s)
const changeColor = taskCreator('ERROR', 'COLOR', (s) => s)
const appendTextAsync = taskCreator('ERROR', 'APPEND', (s) => new Promise(res => {
  // Adding artificial delay here to simulate async requests.
  setTimeout(() => res(s), 20)
}))

/*
 * Component that creates tasks to be run, as well as connect to redux state.
 */
@transact(
  () => {
    return [
      appendText('Hello'),
      appendText(' World'),
      changeColor('purple'),
      appendTextAsync('!')
    ]
  }
)
@connect(state => ({
  message: state.message,
  color: state.color
}))
class App extends React.Component {
  render() {
    const { color, message } = this.props
    return (
      <div style={{ color }}>
        <h1>{message}</h1>
      </div>
    )
  }
}

const routes = <Route path="/" component={App}/>

server.listen(8080, () => {
  server.all('/', (req, res) => {
    match({ routes, location: req.url }, (err, redirect, routerProps) => {
      // Install function returns a middleware, and a `done` promise.
      const installed = install(routerProps)

      const store = createStore(reducer, undefined, applyMiddleware(installed))

      const documentElement = (
        <Provider store={store}>
          <RouterRunContext {...routerProps}/>
        </Provider>
      )

      // Wait for all route tasks to resolve.
      installed.done.then(() => {
        // Now call render to get the final HTML.
        const markup = ReactDOM.renderToStaticMarkup(documentElement)
        res.send(`
        <!doctype html>
        ${markup}
        <pre>State = ${JSON.stringify(store.getState(), null, 2)}</pre>
        `)
      })
    })
  })
})
