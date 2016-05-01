import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { transact, taskCreator, RunContext } from 'react-transact'

/*
 * Action types that can be handled in this application.
 */
const MESSAGE_CHANGED = 'MESSAGE_CHANGED'
const MESSAGE_ERROR = 'MESSAGE_ERROR'

/*
 * This is the state reducer for the `RunContext` component. The local state
 * of `RunContext` will be passed down to `Container` component as props.
 */
const reducer = (state = {}, action) => {
  // When the MESSAGE_CHANGED action is dispatched, store its payload on state.
  switch (action.type) {
    case MESSAGE_CHANGED:
      return { message: action.payload, hasError: false }
    case MESSAGE_ERROR:
      return { message: action.payload.message, hasError: true }
    default:
      return state
  }
}

// When called with a message string, causes `MESSAGE_CHANGED` to be dispatched.
// On error, the `MESSAGE_ERROR` is dispatched.
const setMessage = taskCreator(
  MESSAGE_ERROR,
  MESSAGE_CHANGED,
  (msg) => {
    // When we see the substring of 'error', fail this task.
    if (msg.toUpperCase().indexOf('ERROR') !== -1) {
      throw new Error(msg)
    // Otherwise, succeed with the message.
    } else {
      return msg
    }
  }
)

// Helper to delay value dispatches. Used in the @transact below.
export const delay = (ms) => (x) => new Promise((res) => {
  setTimeout(() => res(x), ms)
})

const welcome = [
  setMessage('Welcome to the basic example. :)'),
  setMessage('You can write your own message here.').map(delay(1500)),
  setMessage('Have fun!').map(delay(3000))
]

// When this component is mounted, dispatch the actions from the supplied tasks.
@transact((state, props, commit) => welcome, { onMount: true })
class Messenger extends Component {
  render() {
    return (
      <div className="messenger">
        <form onSubmit={(evt) => {
          evt.preventDefault()
          const { run } = this.props.transact
          const { value } = this.refs.input

          if (value.toUpperCase() === 'RESTART') {
            run(welcome)
          } else if (value) {
            run(setMessage(value))
          } else {
            run(setMessage('Hmm, you left the message empty. Was that an error? :('))
          }

          this.refs.input.value = ''
        }}>
          <input placeholder="Write something else" autoFocus={true} ref="input"/>
          <button>Go</button>
        </form>
        <p className="hint">
          (Psst, try typing "restart" or an empty string "")
        </p>
      </div>
    )
  }
}

const Container = ({ message, hasError }) => {
  return (
    <div className="container">
      <div className={hasError ? 'error' : ''}>
        <p className="message"><em>{message}</em></p>
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
