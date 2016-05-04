const Task = ReactTransact.Task
const taskCreator = ReactTransact.taskCreator
const transact = ReactTransact.transact
const RunContext = ReactTransact.RunContext
const h = React.createElement

// Tasks
const inc = Task.resolve({ type: 'INCREMENT' })
const dec = Task.resolve({ type: 'DECREMENT' })

// Create a HOC with transact.
const Container = transact()(
  // The state and transact props are coming from RunContext.
  ({ transact }) => {
    const state = transact.store.getState()
    return h('div', {},
      h('div', { className: 'container', children: [
        h('button', { onClick: () => transact.run(dec) }, ['-']),
        h('p', {}, [state.counter]),
        h('button', { onClick: () => transact.run(inc) }, ['+'])
      ]})
    )
  }
)

const stateReducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT': return { counter: state.counter + 1 }
    case 'DECREMENT': return { counter: state.counter - 1 }
    default: return (state || { counter: 0 })
  }
}

// Render the application with state reducer and starting props.
ReactDOM.render(
  h(RunContext, { stateReducer },
    h(Container)
  ),
  document.getElementById('app')
)
