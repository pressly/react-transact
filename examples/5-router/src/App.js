import React, { Component } from 'react'
import { Link } from 'react-router'
import { transact, taskCreator } from 'react-transact'
import { connect } from 'react-redux'
import { changeColor } from './tasks'

const itemStyle = { display: 'inline-block', margin: '0 3px', fontSize: '18px' }

@transact.route('startingColor', (state, props) => changeColor(props.startingColor))
@connect(() => ({}))
export default class App extends Component {
  render() {
    const { startingColor } = this.props
    return  (
      <div style={{ marginBottom: '20px', width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <ul style={{ borderBottom: 'solid 1px #ccc', margin: 0, padding: 0, listStyle: 'none' }}>
          <li style={itemStyle}>
            <Link activeClassName="active" onlyActiveOnIndex={true} to={`/${startingColor}`}>Colors</Link>
          </li>
          <li style={itemStyle}>
            <Link activeClassName="active" onlyActiveOnIndex={true} to={`/${startingColor}/echo/buffalo?times=3`}>Echo</Link>
          </li>
          <li style={itemStyle}>
            <Link activeClassName="active" onlyActiveOnIndex={true} to={`/${startingColor}/greeting`}>Greeting</Link>
          </li>
          <li style={itemStyle}>
            <Link activeClassName="active" onlyActiveOnIndex={true} to={`/${startingColor}/message`}>Message</Link>
          </li>
        </ul>
        <div style={{ flex: 1, display: 'flex' }}>
          { this.props.children }
        </div>
      </div>
    )
  }
}
