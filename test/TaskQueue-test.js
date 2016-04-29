const test = require('tape')
const sinon = require('sinon')
const Task = require('../index').Task
const TaskQueue = require('../lib/TaskQueue').default

test('TaskQueue', (t) => {
  t.plan(4)

  const dispatch = sinon.spy()
  const queue = new TaskQueue()

  queue.push((state, props) => [
    Task.resolve({ type: 'GOOD', payload: `${props.type} ${state.name}!` }),
    Task.reject({ type: 'BAD', payload: 'Bye!' })
  ])

  queue.push((state, props) => [
    Task.resolve({ type: 'GOOD', payload: `${state.name} says "${props.type}!"` })
  ])

  queue.run(dispatch, { name: 'Alice' }, { type: 'Hello' }).then(() => {
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
  t.plan(4)

  const dispatch = sinon.spy()
  const queue = new TaskQueue()

  queue.push((state, props) => [
    Task.resolve({ type: 'GOOD', payload: `${state.name} says "${props.type}!"` })
  ])

  const p = queue.run(dispatch, { name: 'Alice' }, { type: 'Hello' })

  t.ok(typeof p.then === 'function', 'returns a promise')

  p.then(() => {
    t.ok(true, 'resolves promise on computation completion')
    t.equal(queue.size, 0, 'removes successfully completed tasks')

    const p2 = queue.run(dispatch, null, null)

    p2.then(() => {
      t.ok(true, 'resolves promise when no computations are queued')
    })
  })
})
