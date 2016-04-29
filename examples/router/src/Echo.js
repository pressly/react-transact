import React from 'react'
import { connect } from 'react-redux'
import { transact, taskCreator } from 'react-transact'
import { scan } from 'ramda'

const say = taskCreator('ERROR', 'ECHO', (what) => what)
const repeat = taskCreator('ERROR', 'ECHO', (what) => {
  return `${what} ${what}`
})

const delay = (ms) => (x) => new Promise((res) => {
  setTimeout(() => res(x), ms)
})

const Echo = transact()((state, props) => (
  scan(
    (acc, task) => {
      return acc.chain(task).map(delay(1000))
    },
    say(props.params.what),
    [
      repeat,
      repeat,
      repeat,
      repeat,
      repeat
    ]
  )
))(
  connect(state => ({
    what: state.what
  })
)(({ what}) => (
    <div className="content">
      { what}
    </div>
)))

Echo.displayName = 'Echo'

export default Echo
