const test = require('tape')
const sinon = require('sinon')
const effects = require('../lib/effects')
const Task = require('../lib/Task').default

test('trace', (t) => {
  const { trace } = effects
  const hello = new Task((rej, res) => res({ type: 'MESSAGE', payload: 'Hello' }))

  const log = sinon.spy(console, 'log')

  hello.chain(trace('Message is')).fork(() => {
    t.ok(log.called, 'console.log is called')
    t.equal(log.firstCall.args[0], 'Message is', 'message is printed')
    t.equal(log.firstCall.args[1], 'Hello', 'payload is printed')
    log.restore()
    t.end()
  })
})

test('tap', (t) => {
  const { tap } = effects
  const hello = new Task((rej, res) => res({ type: 'MESSAGE', payload: 'Hello' }))
  const fn = sinon.spy()
  
  hello.chain(tap(fn)).fork(() => {
    t.ok(fn.called, 'function is called')
    t.equal(fn.firstCall.args[0], 'Hello', 'function is applied with payload')
    t.end()
  })
})
