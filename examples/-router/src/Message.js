import React, { Component } from 'react'
import { taskCreator } from 'react-transact'
import { connect } from 'react-redux'

const changeMessage = taskCreator(
  'MESSAGE_ERROR',
  'MESSAGE_CHANGED',
  (message) => message
)  

@connect(state => ({ message: state.message }))
export default class Message extends Component {
  render() {
    const { message, dispatch } = this.props
    return (
      <div className="content">
        <p>You said: "{ message }"</p>

        <p>
          Say something else:
        </p>
        <form onSubmit={(evt) => {
            evt.preventDefault()
            dispatch(changeMessage(this.refs.input.value))
          }}>
          <input ref="input"/>
          <button>Go</button>
        </form>
      </div>
    )
  }
}
