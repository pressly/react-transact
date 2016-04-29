import React from 'react'
import { connect } from 'react-redux'
import { transact, taskCreator } from 'react-transact'
import delay from './delay'

const Colors = transact()((state, props) => [
  taskCreator('ERROR', 'COLOR_CHANGED', () => 'black')(),
  taskCreator('ERROR', 'COLOR_CHANGED', () => delay('yellow', 1000))(),
  taskCreator('ERROR', 'COLOR_CHANGED', () => delay('red', 2000))(),
  taskCreator('ERROR', 'COLOR_CHANGED', () => delay('blue', 3000))(),
  taskCreator('ERROR', 'COLOR_CHANGED', () => delay('green', 4000))()
])(
  connect(state => ({
    color: state.color
  })
)(({ color}) => (
    <div className="content" style={{ textShadow: '1px 1px #000', color: '#fff', flex: 1, backgroundColor: color }}>
      <p>{ color }</p>
    </div>
)))

Colors.displayName = 'Colors'

export default Colors
