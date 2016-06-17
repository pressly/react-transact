import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { transact, call, TransactContext } from 'react-transact'

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

const toMessage = (msg) => {
  // When we see the substring of 'error', fail this task.
  if (msg.toUpperCase().indexOf('ERROR') !== -1) {
    throw new Error(msg)
    // Otherwise, succeed with the message.
  } else {
    return msg
  }
}

// Helper to delay value dispatches. Used in the @transact below.
export const delay = (ms) => (x) => new Promise((res) => {
  setTimeout(() => res(x), ms)
})

// When this component is mounted, dispatch the actions from the supplied tasks.
@transact(({ onMessage }) =>
  () => onMessage('You can write your own message here.'),
  { onMount: true })
class Messenger extends Component {
  render() {
    const { onMessage, onError } = this.props
    return (
      <div className="messenger">
        <form onSubmit={(evt) => {
          evt.preventDefault()
          const { run } = this.props.transact
          const { value } = this.refs.input

          if (value) {
            run(onMessage(value))
          } else {
            run(onError('Hmm, you left the message empty. Was that an error? :('))
          }

          this.refs.input.value = ''
        }}>
          <input placeholder="Write something else" autoFocus={true} ref="input"/>
          <button>Go</button>
        </form>
        <p className="hint">
          (Psst, try typing an empty string "")
        </p>
      </div>
    )
  }
}


class Container extends Component {
  constructor(props) {
    super(props)
    this.state = { message: '' }
  }
  render() {
    return (
      <div className="container">
        <div className={this.state.hasError ? 'error' : ''}>
          <p className="message"><em>{this.state.message}</em></p>
          <Messenger
            onMessage={(message) => {
              this.setState({ message, hasError: false })
            }}
            onError={(message) => {
              this.setState({ message, hasError: true })
            }}/>
        </div>
      </div>
    )
  }
}

ReactDOM.render(
  <TransactContext stateReducer={reducer}>
    <Container/>
  </TransactContext>,
  document.getElementById('app')
)
