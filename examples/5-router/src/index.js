import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Redirect, Router, Route, IndexRoute, hashHistory } from 'react-router'
import { RunContext } from 'react-transact'
import configureStore from './configureStore'
import App from './App'
import Colors from './Colors'
import Echo from './Echo'
import Greeting from './Greeting'
import Message from './Message'

const store = configureStore({ name: 'World', error: false })

ReactDOM.render(
  <div style={{ fontSize: '24px', textAlign: 'center' }}>
    <Provider store={store}>
      <RunContext>
        <Router history={hashHistory}>
          <Route path="/:startingColor" component={App}>
            <IndexRoute component={Colors}/>
            <Route path="echo/:what/:times" component={Echo}/>
            <Route path="greeting" component={Greeting}/>
            <Route path="message" component={Message}/>
          </Route>
          <Redirect from="*" to="/cyan"/>
        </Router>
      </RunContext>
    </Provider>
  </div>,
  document.getElementById('app')
)
