import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { transact, call, TransactContext } from 'react-transact'

/*
 * Action types that can be handled in this application.
 */
const MESSAGE_CHANGED = 'MESSAGE_CHANGED'
const MESSAGE_ERROR = 'MESSAGE_ERROR'

// Helper to delay value dispatches. Used in the @transact below.
export const delay = (ms) => (x) => new Promise((res) => {
  setTimeout(() => res(x), ms)
})

// When this component is mounted, dispatch the actions from the supplied tasks.
@transact(({ onMessage }) =>
  call(onMessage, 'You can write your own message here.'),
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
  <TransactContext>
    <Container/>
  </TransactContext>,
  document.getElementById('app')
)
