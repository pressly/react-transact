const test = require('tape')
const sinon = require('sinon')
const Task = require('../../../lib/internals/Task').default
const TaskQueue = require('../../../lib/internals/TaskQueue').default

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
  t.plan(11)

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
      new Task((rej, res, progress) => {
        progress({ type: 'PROGRESS' })
        res({ type: 'GOOD', payload: `${state.name} says "${props.type}!"` })
      })
    ],
    props: { type: 'Bye' }
  })

  const p2 = queue.run(dispatch, { name: 'Bob' })

  p2.then(() => {
    t.equal(dispatch.callCount, 3, 'maintains total ordering (first run completes before second)')
    t.deepEqual(dispatch.secondCall.args[0], {
      type: 'PROGRESS'
    })
    t.deepEqual(dispatch.thirdCall.args[0], {
      type: 'GOOD', payload: 'Bob says "Bye!"'
    })
  })

  const p3 = queue.run(dispatch, null)

  p3.then(() => {
    t.equal(dispatch.callCount, 3, 'resolves promise when no computations are queued')
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
    t.equal(dispatch.callCount, 3, 'resolves promise when mapped tasks are nil')
  })
})

test('Task#run (ordering)', (t) => {
  const dispatch = sinon.spy()
  const queue = new TaskQueue()
  const message = (msg) =>
    new Task((rej, res) => {
      setTimeout(() => {
        res({ type: 'MESSAGE', payload: msg })
      }, Math.random() * 100)
    })

  const error = (msg) =>
    new Task((rej, res) => {
      setTimeout(() => {
        rej({ type: 'ERROR', payload: msg })
      }, Math.random() * 100)
    })

  queue.push({
    mapper: () => [
      message('Hey')
    ],
    props: {}
  })

  queue.push({
    mapper: () => [
      message('Hello')
    ],
    props: {}
  })

  // Run in the middle before queuing additional tasks.
  // Need to ensure that we still maintain ordering even across multiple runs.
  queue.run(dispatch)

  queue.push({
    mapper: () => [
      error('Oops')
    ],
    props: {}
  })

  queue.push({
    mapper: () => [
      message('Bye')
    ],
    props: {}
  })

  queue.run(dispatch, {}).then(() => {
    t.equal(dispatch.callCount, 4, 'dispatched all actions')

    t.deepEqual(dispatch.firstCall.args[0], {
      type: 'MESSAGE',
      payload: 'Hey'
    }, 'correctly dispatches first action')

    t.deepEqual(dispatch.secondCall.args[0], {
      type: 'MESSAGE',
      payload: 'Hello'
    }, 'correctly dispatches second action')

    t.deepEqual(dispatch.thirdCall.args[0], {
      type: 'ERROR',
      payload: 'Oops'
    }, 'correctly dispatches third action')

    t.deepEqual(dispatch.getCall(3).args[0], {
      type: 'MESSAGE',
      payload: 'Bye'
    }, 'correctly dispatches last action')

    t.end()
  })
})
