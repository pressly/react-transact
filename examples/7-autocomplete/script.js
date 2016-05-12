const Task = ReactTransact.Task
const taskCreator = ReactTransact.taskCreator
const transact = ReactTransact.transact
const install = ReactTransact.install
const RunContext = ReactTransact.RunContext
const h = React.createElement

// Tasks
const clear = Task.resolve({ type: 'CLEAR' })
const searchWikipedia = taskCreator(
  'ERROR',
  'RESULTS',
  (term) =>
    $.ajax({
      url: 'http://en.wikipedia.org/w/api.php',
      dataType: 'jsonp',
      data: {
        action: 'opensearch',
        format: 'json',
        search: term
      }
    }).promise().then(data => ({ results: data[1], term: term }))
)

const handleTermChange = (transact, value) => {
  if (value) {
    transact.run(searchWikipedia(value))
  } else {
    transact.run(clear)
  }
}

// Create a HOC with transact.
const Container = transact()(
  ReactRedux.connect(state => ({ results: state.results }))(
    // The state and transact props are coming from RunContext.
    ({ transact, results }) => {
      return h('div', {},
        h('div', { className: 'container', children: [
          h('div', { children: [
            h('input', {
              autoFocus: true,
              placeholder: 'Start typing...',
              type: 'text',
              onChange: (evt) => handleTermChange(transact, evt.target.value)
            })
          ]}),
          results.length > 0
            ? (
              h('div', { children: [
                h('h3', {}, 'Results'),
                h('ul', {
                  children: results.map(r => h('li', { key: r }, [r]))
                })
              ]})
            )
            : null
        ]})
      )
    }
  )
)

const reducer = (state = { results: [] }, action) => {
  switch (action.type) {
    case 'RESULTS':
      return { results: action.payload.results }
    case 'CLEAR':
      return { results: [] }
    default:
      return state
  }
}

const store = Redux.createStore(reducer, undefined, Redux.applyMiddleware(install()))

// Render the application with state reducer and starting props.
ReactDOM.render(
  h(ReactRedux.Provider, { store: store, children:
    h(RunContext, {},
      h(Container)
    )
  }),
  document.getElementById('app')
)
