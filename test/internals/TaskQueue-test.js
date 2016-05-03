const test = require('tape')
const sinon = require('sinon')
const Task = require('../../lib/internals/Task').default
const TaskQueue = require('../../lib/internals/TaskQueue').default

test('TaskQueue', (t) => {
  t.plan(4)

  const dispatch = sinon.spy()
  const queue = new TaskQueue()

  queue.push({
    mapper: (state, props) => [
      Task.resolve({ type: 'GOOD', payload: `${props.type} ${state.name}!` }),
      Task.reject({ type: 'BAD', payload: 'Bye!' })
    ],
    props: { type: 'Hello' }
  })

  queue.push({
    mapper: (state, props) => [
      Task.resolve({ type: 'GOOD', payload: `${state.name} says "${props.type}!"` })
    ],
    props: { type: 'Hello' }
  })

  queue.run(dispatch, { name: 'Alice' }).then(() => {
    t.equal(dispatch.callCount, 3)

    t.deepEqual(dispatch.firstCall.args[0], {
      type: 'GOOD',
      payload: 'Hello Alice!'
    })

    t.deepEqual(dispatch.secondCall.args[0], {
      type: 'BAD',
      payload: 'Bye!'
    })

    t.deepEqual(dispatch.thirdCall.args[0], {
      type: 'GOOD',
      payload: 'Alice says "Hello!"'
    })
  })
})

test('TaskQueue#run (completion)', (t) => {
  t.plan(10)

  const dispatch = sinon.spy()
  const queue = new TaskQueue()

  queue.push({
    mapper: (state, props) => [
      Task.resolve({ type: 'GOOD', payload: `${state.name} says "${props.type}!"` })
    ],
    props: { type: 'Hello' }
  })

  const p = queue.run(dispatch, { name: 'Alice' })

  t.ok(typeof p.then === 'function', 'returns a promise')

  p.then((results) => {
    t.ok(true, 'resolves promise on computation completion')
    t.equal(queue.size, 0, 'removes successfully completed tasks')
    t.deepEqual(dispatch.firstCall.args[0], {
      type: 'GOOD', payload: 'Alice says "Hello!"'
    })
    t.equal(results.length, 1, 'returns results of tasks run')
    t.deepEqual(results[0].action, {
      type: 'GOOD', payload: 'Alice says "Hello!"'
    }, 'action is returned')
  })

  queue.push({
    mapper: (state, props) => [
      Task.resolve({ type: 'GOOD', payload: `${state.name} says "${props.type}!"` })
    ],
    props: { type: 'Bye' }
  })

  const p2 = queue.run(dispatch, { name: 'Bob' })

  p2.then(() => {
    t.equal(dispatch.callCount, 2, 'maintains total ordering (first run completes before second)')
    t.deepEqual(dispatch.secondCall.args[0], {
      type: 'GOOD', payload: 'Bob says "Bye!"'
    })
  })

  const p3 = queue.run(dispatch, null)

  p3.then(() => {
    t.equal(dispatch.callCount, 2, 'resolves promise when no computations are queued')
  })

  queue.push({
    mapper: (state, props) => [
      null,
      undefined
    ],
    props: {}
  })

  const p4 = queue.run(dispatch, null)

  p4.then(() => {
    t.equal(dispatch.callCount, 2, 'resolves promise when mapped tasks are nil')
  })
})
