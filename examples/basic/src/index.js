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
      <div className="messenger">
        <form onSubmit={(evt) => {
          evt.preventDefault()
          this.props.transact.run(setMessage(this.refs.input.value))
        }}>
          <label>
            Write something else:
            <input autoFocus={true} ref="input"/>
          </label>
          <button>Go</button>
        </form>
      </div>
    )
  }
}

const Container = ({ message }) => {
  return (
    <div className="container">
      <div>
        <p className="message">Current message: <em>{message}</em></p>
        <Messenger/>
      </div>
    </div>
  )
}

ReactDOM.render(
  <RunContext stateReducer={reducer}>
    <Container/>
  </RunContext>,
  document.getElementById('app')
)
