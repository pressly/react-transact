# react-transact

Handle data transactions in a declarative way.

## Example

The following is an example of a todo app that lists todos by user.

App.js:

```js
import { RunContext } from 'react-transact'
import React from 'react'
import ReactDOM from 'react-dom'
import UserTodos from './UserTodos'

ReactDOM.render(
  <div>
    <h1>Todo App</h1>
    <RunContext>
      <UserTodos userId={1}/>
    </RunContext>
  </div>
  ,
  document.getElementById('app')
)

```

UserTodos.js:

```js
import { scan } from 'ramda'
import { transact, taskCreator } from 'react-transact'

const getUser = taskCreator(
  'GET_USER_ERROR',
  'USER_LOADED',
  (userId) => fetch(`/users/${userId}`))

const getUserTodos = taskCreator(
  'GET_TODOS_ERROR',
  'TODOS_LOADED',
  (user) => fetch(`/users/${user.id}/todos`)
)

// Run tasks when this component mounts
@transact((state, props) => (
  // Scan is like reduce, but returns each successively reduced value
  scan(
    // Chains the next task using the eventual result of current task
    (task, next) => task.chain(next),
    
    // Initial task
    getUser(props.userId),
    
    // Chainable task creators
    [
      getUserTodos
    ]
  )
))
// Regular react-redux connect, assuming the state is updated via above tasks
@connect(
  (state) => ({
    todos: state.todos,
    user: state.user
  })
)
class UserTodos extends React.Component {
  render() {
    const { todos, user } = this.props
    return (
      <div>
        Showing todos for user = {user.name}:
        { todos.map(t => <p>{ t.text }</p>) }
      </div>
    )
  }
}
```

For more examples, see the [examples](./examples) folder.

## API

### Task

The `Task<A,B>` structure represents a disjunction for actions that depend on time.

`Task<A,B>` may either contain an action of type A, or an action of type B.

The left-side `A` of the disjunction represents a rejection, while the right-side `B`
represents resolution. This structure is biased on the right-side, thus projections
will take the right value over the left value.

Example: 

```js
const sayHello = (name) => Task((rej, res) => {
  try {
    res({ type: 'RECEIVED_MESSAGE', payload: `Hello ${name}!` })
  } catch (e) {
    rej({ type: 'RECEIVED_MESSAGE_ERROR', payload: e })
  }
})

// This will print 'Dispatched: { "type": "RECEIVED_MESSAGE", "payload": "Hello Bob!" }'
sayHello('Bob').fork(
  (x) => console.log(`Dispatched: ${JSON.stringify(x)}`)
)
```
