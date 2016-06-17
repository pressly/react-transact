const Task = ReactTransact.Task
const transact = ReactTransact.transact
const taskCreator = ReactTransactRedux.taskCreator
const reduxTransact = ReactTransactRedux.reduxTransact
const ReduxTransactContext = ReactTransactRedux.ReduxTransactContext
const SCHEDULED_TASKS_PENDING = ReactTransactRedux.SCHEDULED_TASKS_PENDING
const SCHEDULED_TASKS_COMPLETED = ReactTransactRedux.SCHEDULED_TASKS_COMPLETED
const h = React.createElement

// Tasks
const clear = Task.resolve({ type: 'CLEAR' })
const searchWikipedia = taskCreator(
  'ERROR',
  'RESULTS',
  'PENDING',
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

const handleTermChange = (dispatch, value) => {
  if (value) {
    dispatch(searchWikipedia(value))
  } else {
    dispatch(clear)
  }
}

// Create a HOC with transact.
const Container = transact()(
  ReactRedux.connect(state => ({ pending: state.pending, results: state.results }))(
    // The state and transact props are coming from ReduxTransactContext.
    ({ dispatch, results, pending }) => {
      return h('div', {},
        h('div', { className: 'container', children: [
          h('div', { children: [
            h('input', {
              autoFocus: true,
              placeholder: 'Start typing...',
              type: 'text',
              onChange: (evt) => handleTermChange(dispatch, evt.target.value)
            })
          ]}),
          h('p', { className: 'loading' }, pending ? 'Loading...' : ''),
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
      return { results: action.payload.results, pending: false  }
    case 'CLEAR':
      return { results: [], pending: false  }
    case 'PENDING':
      return Object.assign({}, state, { pending: true })
    default:
      return state
  }
}

const store = Redux.createStore(reducer, undefined, Redux.applyMiddleware(reduxTransact()))

// Render the application with state reducer and starting props.
ReactDOM.render(
  h(ReactRedux.Provider, { store: store, children:
    h(ReduxTransactContext, {},
      h(Container)
    )
  }),
  document.getElementById('app')
)
