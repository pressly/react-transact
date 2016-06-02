import React, { Component } from 'react'
import { taskCreator, transact } from 'react-transact'
import { connect } from 'react-redux'
import delay from './delay'

@transact.route(() => [
  taskCreator('ERROR', 'NAME_CHANGED', () => delay('Alice', 1000))(),
  taskCreator('ERROR', 'NAME_CHANGED', () => delay('Bob', 2000))(),
  taskCreator('ERROR', 'NAME_CHANGED', () => delay(null, 3000, true))(),
  taskCreator('ERROR', 'NAME_CHANGED', () => delay('World', 4000))()
])
@connect(
  state => ({
    error: state.error,
    name: state.name
  })
)
export default class Greeting extends Component {
  render() {
    const { name, error } = this.props
    return (
      <div className="content" style={{ color: error ? 'red' : 'black' }}>
        Hello {name}!
      </div>
    )
  }
}
