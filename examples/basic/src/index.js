import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { transact, taskCreator, RunContext } from 'react-transact'

const reducer = (state = {}, action) => {
  if (action.type === 'MESSAGE') {
    return { message: action.payload }
  } else {
    return state
  }
}

const setMessage = taskCreator(
  'ERROR',
  'MESSAGE',
  (msg) => msg
)

@transact((state, props, commit) => [
  setMessage('Hi! :)')
])
class Messenger extends Component {
  render() {
    return (
      <div>
        <p>
          Change message to:
        </p>
        <form onSubmit={(evt) => {
          evt.preventDefault()
          this.props.transact.run(setMessage(this.refs.input.value))
        }}>
          <input ref="input"/>
          <button>Go</button>
        </form>
      </div>
    )
  }
}

const Container = ({ message }) => {
  return (
    <div>
      <p>Current message: {message}</p>
      <Messenger/>
    </div>
  )
}

ReactDOM.render(
  <RunContext stateReducer={reducer}>
    <Container/>
  </RunContext>,
  document.getElementById('app')
)
