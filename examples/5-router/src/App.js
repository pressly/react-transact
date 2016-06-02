import React, { Component } from 'react'
import { Link } from 'react-router'
import { transact, taskCreator } from 'react-transact'
import { connect } from 'react-redux'
import { changeColor } from './tasks'

const itemStyle = { display: 'inline-block', margin: '0 3px', fontSize: '18px' }

@transact(() => changeColor('cyan'))
@connect(() => ({}))
export default class App extends Component {
  render() {
    return  (
      <div style={{ marginBottom: '20px', width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <ul style={{ borderBottom: 'solid 1px #ccc', margin: 0, padding: 0, listStyle: 'none' }}>
          <li style={itemStyle}>
            <Link activeClassName="active" onlyActiveOnIndex={true} to="/">Colors</Link>
          </li>
          <li style={itemStyle}>
            <Link activeClassName="active" onlyActiveOnIndex={true} to="/echo/buffalo">Echo</Link>
          </li>
          <li style={itemStyle}>
            <Link activeClassName="active" onlyActiveOnIndex={true} to="/greeting">Greeting</Link>
          </li>
          <li style={itemStyle}>
            <Link activeClassName="active" onlyActiveOnIndex={true} to="/message">Message</Link>
          </li>
        </ul>
        <div style={{ flex: 1, display: 'flex' }}>
          { this.props.children }
        </div>
      </div>
    )
  }
}
