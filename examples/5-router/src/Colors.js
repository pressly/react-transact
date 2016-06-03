import React, { Component } from 'react'
import { connect } from 'react-redux'
import { transact, taskCreator } from 'react-transact'
import { changeColor } from './tasks'

const delay = (ms) => (x) => new Promise((res) => {
  setTimeout(() => res(x), ms)
})

@transact.route({}, () => [
  changeColor('black').map(delay(1000)),
  changeColor('yellow').map(delay(2000)),
  changeColor('red').map(delay(3000)),
  changeColor('blue').map(delay(4000)),
  changeColor('green').map(delay(5000))
])
@connect(state => ({
  color: state.color
}))
export default class Colors extends Component {
  render() {
    const { color } = this.props
    return (
      <div className="content" style={{ textShadow: '1px 1px #000', color: '#fff', flex: 1, backgroundColor: color }}>
        <p>{ color }</p>
      </div>
    )
  }
}
