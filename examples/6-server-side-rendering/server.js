import express from 'express'
import React from 'react'
import ReactDOM from 'react-dom/server'
import {Route, match} from 'react-router'
import {Provider, connect} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import {transact, Task, RouterRunContext, install} from '../../index'

const server = express()

const reducer = (state , action) => {
  if (action.type === 'HELLO') return { message: 'Hello World!' }
  else return state || { message: 'Test' }
}

@transact(
  (state, props) => {
    return [Task.resolve({ type: 'HELLO' })]
  }
)
@connect(state => ({message: state.message}))
class App extends React.Component {
  render() {
    const { message } = this.props
    return <h1>{message}</h1>
  }
}

const routes = <Route path="/" component={App}/>

server.listen(8080, () => {
  server.all('/', (req, res) => {
    match({ routes, location: req.url }, (err, redirect, routerProps) => {
      const m = install(routerProps)
      const store = createStore(reducer, {}, applyMiddleware(m))

      const documentElement = (
        <Provider store={store}>
          <RouterRunContext {...routerProps}/>
        </Provider>
      )

      m.done.then(() => {
        const markup = ReactDOM.renderToStaticMarkup(documentElement)
        res.send(`<!doctype html>\n${markup}`)
      })
    })
  })
})
