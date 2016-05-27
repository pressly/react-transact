'use strict'

const test = require('tape')
const Task = require('../../../lib/internals/Task').default
const taskCreator = require('../../../lib/internals/taskCreator').default

test('taskCreator (sync)', (t) => {
  t.plan(4)

  const x = taskCreator('BAD', 'GOOD', () => 42)
  const y = taskCreator('BAD', 'GOOD', () => { throw 'Oops' })
  const z = taskCreator('BAD', 'GOOD', 'PENDING', () => 42)

  t.ok(x() instanceof Task, 'returns a task creator')

  x().fork(() => {}, (action) => {
    t.deepEqual(action, {
      type: 'GOOD',
      payload: 42
    }, 'forks to right side of the disjunction')
  })

  y().fork((action) => {
    t.deepEqual(action, {
      type: 'BAD',
      payload: 'Oops'
    }, 'forks to left side of the disjunction')
  }, () => {})

  z().fork(() => {}, () => {}, (action) => {
    t.deepEqual(action, {
      type: 'PENDING'
    }, 'fork calls progress callback')
  })
})

test('taskCreator (async)', (t) => {
  t.plan(2)

  const x = taskCreator('BAD', 'GOOD', () => Promise.resolve(42))
  const y = taskCreator('BAD', 'GOOD', () => Promise.reject('Oops'))

  x().fork(() => {}, (action) => {
    t.deepEqual(action, {
      type: 'GOOD',
      payload: 42
    }, 'forks to right side of the disjunction')
  })

  y().fork((action) => {
    t.deepEqual(action, {
      type: 'BAD',
      payload: 'Oops'
    }, 'forks to left side of the disjunction')
  }, () => {})
})

