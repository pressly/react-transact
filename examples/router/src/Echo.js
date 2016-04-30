import React from 'react'
import { connect } from 'react-redux'
import { transact, taskCreator } from 'react-transact'
import { reduce } from 'ramda'

const say = taskCreator('ERROR', 'ECHO', (what) => what)
const repeat = taskCreator('ERROR', 'ECHO', (what) => {
  return `${what} ${what}`
})

const delay = (ms) => (x) => new Promise((res) => {
  setTimeout(() => res(x), ms)
})

const Echo = transact((state, props, commit) => (
  reduce(
    (task, next) => {
      return (
        commit(task)        // This will commit the resulting from this task action
          .chain(next)      // Chain the resulting action to the next task
          .map(delay(500))  // Map a 500ms delay before resolving task.
      )
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
