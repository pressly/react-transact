const Task = ReactTransact.Task
const taskCreator = ReactTransact.taskCreator
const transact = ReactTransact.transact
const RunContext = ReactTransact.RunContext
const h = React.createElement

// Task creators
const k = taskCreator('ERROR', 'VALUE', x => x)
const inc = taskCreator('ERROR', 'VALUE', x => x + 1)
const dec = taskCreator('ERROR', 'VALUE', x => x - 1)

// Transforms
const delay = (seconds) => (x) => new Promise((res) => setTimeout(() => res(x), seconds * 1000))

// Create a HOC with transact.
const Container = transact(
  (state, props, commit) => {
    const to = props.to
    const from = props.from
    const diff = to - from
    // Array of task creators of either `inc` or `dec tasks that will count from `from` to `to`.
    return new Array(Math.abs(diff)).fill(diff > 0 ? inc : dec)
      .reduce(
        // Each successive action will be dispatched using `commit`, then chained to next task creator.
        (task, next) => commit(task).chain(next).map(delay(props.delay)),
        // Startng with the `from` prop value
        k(from)
      )
  }
)(
  // The state props is coming from RunContext.
  ({ transact }) => h('div', {},
    h('h1', { className: 'container' },
      [transact.store.getState().value]
    )
  )
)

const stateReducer = (state, action) => {
  switch (action.type) {
    case 'VALUE': return { value: action.payload }
    default: return (state || {})
  }
}

// Render the application with state reducer and starting props.
ReactDOM.render(
  h(RunContext, { stateReducer },
    h(Container, {
      // Try changing these values.
      from: 10,
      to: 0,
      delay: 1
    })
  ),
  document.getElementById('app')
)
