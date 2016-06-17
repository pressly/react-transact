import React, { Component } from 'react'
import { connect } from 'react-redux'
import { transact } from 'react-transact'
import { taskCreator } from 'react-transact/redux'
import { always as k, times } from 'ramda'

const say = taskCreator('ERROR', 'ECHO', (what, n) => times(k(what), n).join(' '))

@transact.route(
  {
    params: ['what'],
    query: ['times'],
    defaults: { times: '3' }
  },
  (props) => say(props.what, Number(props.times))
)
@connect(state => ({
  what: state.what
}))
export default class Echo extends Component {
  render() {
    const { what } = this.props
    return (
      <div className="content">
        { what }
      </div>
    )
  }
}
