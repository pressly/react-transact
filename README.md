# React Transact

Simple, effortless way to fetch async data or perform computations, then make 
the results available to React components.

Works with Redux and React-Router out of the box. Also supports server-side
rendering!

This project draws a lot of inspiration from the [`data.task`](https://github.com/folktale/data.task)
library of [Folktale](http://folktalejs.org/). I highly recommend you check Folktale out!

For a quick in-browser example, check out the [Counter app](http://embed.plnkr.co/OLH7WaNguDDake7yB6aQ/).

**Note:** This is an early release of this library, so expect API to change
in the future. I will try to keep public API as stable as possible, and strive
to make additive changes as much as possible.

## Goal

The main goal of this project is to make data fetching as simple, effortless, and robust
as possible. There should only be one obvious way to fetch and populate data in
an application. Fetching data must be guaranteed to succeed or fail, as well
maintain ordering (e.g. total ordering of fetch requests). Mechanisms for failure 
recovery should be dead simple -- this is currently a work-in-progress, and only exposed
as a low-level API (`Task#orElse`).

React Transact aims to make data fetching declarative and robust. This is
achieved via the `@transact` decorator and the `Task<A,B>` type. All data
fetching should go through `transact.run` function,
which will ensure correct ordering, and predictable resolution. (`transact` 
is provided as a prop to `@transact`ed components)

The `Task<A,B>` structure represents a disjunction for actions that depend on
time. It can either contain a failure action of type `A`, or a successful action of type `B`.
Projections on `Task<A,B>` is biased towards the right, successful value (of type `B`).

```js
import {Task} from 'react-transact'
new Task.resolve({ type: 'RESOLVED', payload: 1 })
 .map(x => x + 1)
 // This fork will succeed with `{ type: 'RESOLVED', payload: 2 }`
 // because the `map` will map over the successful payload value.
 .fork(
   (failedAction) => console.log('Something went wrong', failedAction),
   (successAction) => console.log('Yay', successAction)
 )
```

## Usage

The following examples show how React Transact can be used in applications. 

### Basic

The following is an async Hello World example.

```js
import React, {Component} from 'react'
import {RunContext, transact, taskCreator} from 'react-transact'

// Creates a function that returns a Task when invoked.
const sendMessage = taskCreator(
  'ERROR',      // action type for failure
  'MESSAGE',    // action type for success
  async x => x  // async function for payload resolution
)

// Wrap the HelloWorld component with @transact decorator.
// Note: You can also use it as a plain function `transact(...)(HelloWorld)`.
@transact(
  (state, props, commit) => [
    sendMessage('Hello World!')
  ]
)
class HelloWorld extends Component {
  render() {
    // `transact` prop is passed down from `@transact`
    // It makse the store available whether you use Redux or not.
    const { message } = this.props.transact.store.getState()
    return <h1>{message}</h1>
  }
)

// Reducer for our RunContext's local component state. (Redux not used here)
const stateReducer = (state = {}, action) => {
  if (action.type === 'MESSAGE') {
    return { message: action.payload }
  } else {
    return state
  }
}

ReactDOM.render(
  <RunContext stateReducer={stateReducer}>
    <HelloWorld/>
  </RunContext>,
  document.getElementById('app')
)
```

Please see the [examples](./examples) folder more use-cases, including
[server-side rendering](./examples/6-server-side-rendering/server.js).

### Redux and React Router

This is the main use-case of React Transact.

Install the Redux middleware and render `RouterRunContext`:

```js
import React from 'react'
import ReactDOM from 'react-dom'
import {install, RouterRunContext, transact, taskCreator} from 'react-transact'
import {Provider, connect} from 'react-redux'
import {Router, Route} from 'react-router'
import {createStore, applyMiddleware} from 'redux'

const reducer = (state = {}, action) => {
  if (action.type === 'ECHO')
    return { message: action.payload }
  else
    return state
}

const transactMiddleware = install()

// Note: `install()` returns a middleware with a `done` prop that is a Promise
// that resolves when all tasks are resolved on matched routes.
// This is needed if you are doing server-side rendering.
transactMiddleware.done.then(() => console.log('data loaded!'))

const store = createStore(reducer, undefined, applyMiddleware(transactMiddleware))

const echo = taskCreator('FAILED', 'ECHO', x => x)

@transact((state, props) => [
  echo(props.params.what)
])
@connect(state => state.message)
class EchoHandler extends React.Component {
  render() {
    return <p>{ this.props.message }</p>
  }
}

ReactDOM.render(
  <Provider store={store}>
    <Router render={props => <RouterRunContext {...props}/>}>
      <Route path="/:what" component={EchoHandler}/>
    </Router>
  </Provider>,
  document.getElementById('app')
)
```

## Development

Fork and clone this repo.

Install dependencies:

```
npm install
```

Run tests:

```
npm test
```

Or, with faucet (recommended):

```
npm test | faucet
```

Run tests with watch support (working on improving this):

```
npm run test:watch
```

Build to ES5 (output is `umd/ReactTransact.js`):

```
npm run build
```

## Contributing

Contributions are welcome! If you find any bugs, please create an issue
with as much detail as possible to help debug.

If you have any ideas for features, please open up an issue or pull-request.

All pull-requests will be carefully reviewed, and merged once deemed satisfactory.

Documentation, fixing typos, etc. are definitely welcome as well!

## Alternative Projects

Here are other projects that solve the async data problem.

- [ReduxAsyncConnect](https://github.com/Rezonans/redux-async-connect) - Allows you to request async data, store them in Redux state and connect them to your react component.
- [AsyncProps](https://github.com/ryanflorence/async-props) - Co-located data loading for React Router.
