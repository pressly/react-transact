import React from 'react'
import { taskCreator, transact } from 'react-transact'
import { connect } from 'react-redux'

const changeMessage = taskCreator(
  'MESSAGE_ERROR',
  'MESSAGE_CHANGED',
  (message) => message
)  

const Stateful = transact()(
  connect(
    state => ({ message: state.message})
  )(
  class extends React.Component {
    render() {
      const { message, transact } = this.props
      return (
        <div className="content">
          <p>You said: "{ message }"</p>

          <p>
            Say something else:
          </p>
          <form onSubmit={(evt) => {
              evt.preventDefault()
              transact.run(changeMessage(this.refs.input.value))
            }}>
            <input ref="input"/>
            <button>Go</button>
          </form>
        </div>
      )
    }
  }
))

export default Stateful
