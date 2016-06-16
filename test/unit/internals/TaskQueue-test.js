const test = require('tape')
const sinon = require('sinon')
const Task = require('../../../lib/internals/Task').default
const TaskQueue = require('../../../lib/internals/TaskQueue').default

test('TaskQueue', (t) => {
  const onResult = sinon.spy()
  const queue = new TaskQueue()

  queue.push([
    Task.resolve({ type: 'GOOD', payload: 'Hello Alice!' }),
    Task.reject({ type: 'BAD', payload: 'Hello Bob!' })
  ])

  queue.push(Task.reject({ type: 'BAD', payload: 'Bye!' }))

  queue.run(onResult).then(() => {
    t.equal(onResult.callCount, 3)

    t.deepEqual(onResult.firstCall.args[0], {
      type: 'GOOD',
      payload: 'Hello Alice!'
    })

    t.deepEqual(onResult.secondCall.args[0], {
      type: 'BAD',
      payload: 'Hello Bob!'
    })

    t.deepEqual(onResult.thirdCall.args[0], {
      type: 'BAD',
      payload: 'Bye!'
    })

    t.end()
  })
})

test('TaskQueue#run (completion)', (t) => {
  t.plan(11)

  const onResult = sinon.spy()
  const queue = new TaskQueue()

  queue.push(Task.resolve({ type: 'GOOD', payload: 'Alice says "Hello!"'}))

  const p = queue.run(onResult)

  t.ok(typeof p.then === 'function', 'returns a promise')

  p.then((results) => {
    t.ok(true, 'resolves promise on computation completion')
    t.equal(queue.size, 0, 'removes successfully completed tasks')
    t.deepEqual(onResult.firstCall.args[0], {
      type: 'GOOD', payload: 'Alice says "Hello!"'
    })
    t.equal(results.length, 1, 'returns results of tasks run')
    t.deepEqual(results[0].result, {
      type: 'GOOD', payload: 'Alice says "Hello!"'
    }, 'result is returned')
  })

  queue.push(
    new Task((rej, res, progress) => {
      progress({ type: 'PROGRESS' })
      res({ type: 'GOOD', payload: 'Alice says "Bye!"' })
    })
  )

  const p2 = queue.run(onResult)

  p2.then(() => {
    t.equal(onResult.callCount, 3, 'maintains total ordering (first run completes before second)')
    t.deepEqual(onResult.secondCall.args[0], {
      type: 'PROGRESS'
    })
    t.deepEqual(onResult.thirdCall.args[0], {
      type: 'GOOD', payload: 'Alice says "Bye!"'
    })
  })

  const p3 = queue.run(onResult)

  p3.then(() => {
    t.equal(onResult.callCount, 3, 'resolves promise when no computations are queued')
  })

  queue.push([null, undefined])

  const p4 = queue.run(onResult)

  p4.then(() => {
    t.equal(onResult.callCount, 3, 'resolves promise when tasks are nil')
  })
})

test('Task#run (ordering)', (t) => {
  const onResult = sinon.spy()
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

  queue.push(message('Hey'))

  queue.push(message('Hello'))

  // Run in the middle before queuing additional tasks.
  // Need to ensure that we still maintain ordering even across multiple runs.
  queue.run(onResult)

  queue.push(error('Oops'))

  queue.push(message('Bye'))

  queue.run(onResult).then(() => {
    t.equal(onResult.callCount, 4, 'dispatched all actions')

    t.deepEqual(onResult.firstCall.args[0], {
      type: 'MESSAGE',
      payload: 'Hey'
    }, 'correctly dispatches first action')

    t.deepEqual(onResult.secondCall.args[0], {
      type: 'MESSAGE',
      payload: 'Hello'
    }, 'correctly dispatches second action')

    t.deepEqual(onResult.thirdCall.args[0], {
      type: 'ERROR',
      payload: 'Oops'
    }, 'correctly dispatches third action')

    t.deepEqual(onResult.getCall(3).args[0], {
      type: 'MESSAGE',
      payload: 'Bye'
    }, 'correctly dispatches last action')

    t.end()
  })
})
