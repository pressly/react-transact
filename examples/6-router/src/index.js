import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Redirect, Router, Route, IndexRoute, hashHistory } from 'react-router'
import { ReduxTransactContext } from 'react-transact/redux'
import configureStore from './configureStore'
import App from './App'
import Colors from './Colors'
import Echo from './Echo'
import Greeting from './Greeting'
import Message from './Message'

const store = configureStore({ name: 'World', error: false, color: 'cyan' })

ReactDOM.render(
  <div style={{ fontSize: '24px', textAlign: 'center' }}>
    <Provider store={store}>
      <ReduxTransactContext skipInitialRoute={true}>
        <Router history={hashHistory}>
          <Route path="/" component={App}>
            <Route path="echo/:what" component={Echo}/>
            <Route path="greeting" component={Greeting}/>
            <Route path="message" component={Message}/>
            <Route path=":startingColor" component={Colors}/>
          </Route>
          <Redirect from="/" to="/cyan"/>
        </Router>
      </ReduxTransactContext>
    </Provider>
  </div>,
  document.getElementById('app')
)
