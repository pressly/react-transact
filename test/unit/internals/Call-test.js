const test = require('tape')
const sinon = require('sinon')
const Call = require('../../../lib/internals/Call').default

test('Call structure', (t) => {
  const inc = (x) => x + 1
  const call = new Call(inc, 42)
  t.equal(call.computation, inc, 'stores effect')
  t.deepEqual(call.args, [42], 'stores args')
  t.end()
})

test('Call#fork', (t) => {
  t.plan(4)

  const good = new Call((x) => x, 42)
  const goodAsync = new Call((x) => Promise.resolve(x), 42)
  const bad = new Call(() => { throw new Error('oops') })
  const badAsync = new Call(() => Promise.reject('oops'))

  good.fork((x) => {
    t.equal(x, 42, 'calls with returned value')
  })

  goodAsync.fork((x) => {
    t.equal(x, 42, 'calls with resolved promise value')
  })

  bad.fork((x) => {
    t.equal(x.message, 'oops', 'calls with error value')
  })

  badAsync.fork((x) => {
    t.equal(x, 'oops', 'calls with rejected promise value')
  })
})

test('Call#chain', (t) => {
  t.plan(4)

  const good = new Call((x) => x, 42)
  const goodAsync = new Call((x) => Promise.resolve(x), 42)
  const bad = new Call(() => { throw new Error('oops') })
  const badAsync = new Call(() => Promise.reject('oops'))

  good.chain((x) => x + 1).fork((x) => {
    t.equal(x, 43, 'chains with returned value')
  })

  goodAsync.chain((x) => x + 1).fork((x) => {
    t.equal(x,43, 'chains with resolved promise value')
  })

  bad.chain((e) => 'Got: ' + e.message).fork((x) => {
    t.equal(x, 'Got: oops', 'chains with error value')
  })

  badAsync.chain((e) => 'Got: ' + e).fork((x) => {
    t.equal(x, 'Got: oops', 'chains with rejected promise value')
  })
})
