import React from 'react'
import { taskCreator, transact } from 'react-transact'
import { connect } from 'react-redux'
import delay from './delay'

const Greeting = transact((state, props, commit) => [
  taskCreator('ERROR', 'NAME_CHANGED', () => delay('Alice', 1000))(),
  taskCreator('ERROR', 'NAME_CHANGED', () => delay('Bob', 2000))(),
  taskCreator('ERROR', 'NAME_CHANGED', () => delay(null, 3000, true))(),
  taskCreator('ERROR', 'NAME_CHANGED', () => delay('World', 4000))()
])(
  connect(
    state => ({
      error: state.error,
      name: state.name
    })
  )(({ name, error }) =>
    <div className="content" style={{ color: error ? 'red' : 'black' }}>
      Hello {name}!
    </div>)
)
Greeting.displayName = 'Greeting'

export default Greeting
