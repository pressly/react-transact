const test = require('tape')
const sinon = require('sinon')
const h = require('../lib/internals/helpers')

test('compact', (t) => {
  t.deepEqual(
    h.compact([null, 1, 2, undefined, false, null]),
    [1, 2, false],
    'removes nil values from array'
  )
  t.end()
})

test('applyValueOrPromise', (t) => {
  const fn = sinon.spy()
  const v = 1
  const p = Promise.resolve(2)

  h.applyValueOrPromise(fn, v)
  h.applyValueOrPromise(fn, p)

  p.then(() => {
    t.ok(fn.callCount, 2, 'applies function with value or promise')
    t.equal(fn.firstCall.args[0], 1, 'value is applied to function')
    t.equal(fn.secondCall.args[0], 2, 'resolved value of promise is applied to function')

    t.end()
  })
})
