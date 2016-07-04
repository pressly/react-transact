require('../setup')
const React = require('react')
const test = require('tape')
const sinon = require('sinon')
const TransactContext = require('../../lib/components/TransactContext').default
const route = require('../../lib/decorators/route').default
const call = require('../../lib/effects').call
const resolve = require('../../lib/internals/resolve').default

const h = React.createElement

test('route decorator', (assert) => {
  const spy = sinon.spy()

  const SyncChild = route(
    { params: ['what'] },
    ({ what }) => call(spy, `Received A: ${what}`))(
    (props) => h('p', {}, props.message)
  )

  const AsyncChild = route(
    { params: ['what'] },
    ({ what }) => call(() => new Promise((res) => {
        setTimeout(() => {
          spy(`Received B: ${what}`)
          res()
        }, 10)
      }))
    )(
    (props) => h('p', {}, props.message)
  )

  const routeComponent = h('div', { children: [
    SyncChild,
    AsyncChild
  ]})

  const routeProps = { components: [routeComponent], params: { what: 'hello' } }

  resolve(routeProps).then(() => {
    assert.equal(spy.callCount, 2, 'callbacks are invoked')
    assert.equal(spy.getCall(0).args[0], 'Received A: hello', 'first callback invoked with arguments')
    assert.equal(spy.getCall(1).args[0], 'Received B: hello', 'second callback invoked with arguments')
    assert.end()
  })
})
