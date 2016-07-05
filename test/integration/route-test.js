require('../setup')
const React = require('react')
const test = require('tape')
const sinon = require('sinon')
const TransactContext = require('../../lib/components/TransactContext').default
const route = require('../../lib/decorators/route').default
const Task = require('../../lib/internals/Task').default
const taskCreator = require('../../lib/internals/taskCreator').default

const h = React.createElement

test('route decorator', (t) => {
  const factory = route({}, (state, props) => [])

  t.ok(typeof factory === 'function', 'returns a higher-order component')

  const Wrapped = factory(Greeter)

  t.ok(typeof Wrapped.displayName === 'string', 'returns a React component')
  t.equal(Wrapped.someStaticProp, 'hello', 'hoists static props')

  t.end()
})

const Greeter = ({ name }) => h('p', {
  className: 'message'
}, [`Hello ${name}!`])
Greeter.someStaticProp = 'hello'
