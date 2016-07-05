require('../setup')
const mount = require('enzyme').mount
const React = require('react')
const test = require('tape')
const sinon = require('sinon')
const TransactContext = require('../../lib/components/TransactContext').default
const route = require('../../lib/decorators/route').default
const Task = require('../../lib/internals/Task').default
const call = require('../../lib/effects').call
const taskCreator = require('../../lib/internals/taskCreator').default

const h = React.createElement
const delay = (ms) => new Promise((res) => setTimeout(res, ms))

test('route decorator', (t) => {
  const factory = route({}, (state, props) => [])

  t.ok(typeof factory === 'function', 'returns a higher-order component')

  const Greeter = ({ name }) => h('p', {
    className: 'message'
  }, [`Hello ${name}!`])
  Greeter.someStaticProp = 'hello'

  const Wrapped = factory(Greeter)

  t.ok(typeof Wrapped.displayName === 'string', 'returns a React component')
  t.equal(Wrapped.someStaticProp, 'hello', 'hoists static props')

  t.end()
})


test('TransactContext with transact decorator and initialRouteProps', (t) => {
  const spy = sinon.spy()

  const Wrapped = route({
    params: ['a'],
    query: ['b']
  }, () => call(spy))(() => h('p'))

  class Root extends React.Component {
    constructor(props) {
      super(props)
      this.state = { message: '' }
      this.messages = []
    }
    onMessageChange(message) {
      this.messages.push(message)
      this.setState({message})
      return message
    }
    render() {
      return (
        h(TransactContext, {
          initialRouteProps: {
            params: {
              a: 'foo'
            },
            location: {
              query: { b: 'bar' }
            }
          }
        }, h('div', { children: [
            h(Wrapped, {
              params: this.props.params,
              location: this.props.location,
              message: this.state.message,
              onMessageChange: this.onMessageChange.bind(this)
            })
          ]})
        )
      )
    }
  }

  // Same route props as initial
  mount(h(Root, {
    params: {
      a: 'foo'
    },
    location: {
      query: { b: 'bar' }
    }
  }))

  delay(10).then(() => {
    t.ok(!spy.called, 'callback not invoked when route props are same')

    // different route props from initial
    mount(h(Root, {
      params: {
        a: 'Something else!'
      },
      location: {
      }
    }))

    delay(10).then(() => {
      t.ok(spy.called, 'callback is invoked when route props are different')
      t.end()
    })
  })
})