import {applyMiddleware, createStore} from 'redux'
import {install} from 'react-transact'

const m = install()

export default (initialState = {}) => createStore((state = {}, action) => {
  console.log(action)
  switch (action.type) {
    case 'COLOR_CHANGED':
        return { ...state, color: action.payload, error: false }
    case 'NAME_CHANGED':
      return { ...state, name: action.payload, error: false }
    case 'ECHO':
      return { ...state, what: action.payload, error: false }
    case 'MESSAGE_CHANGED':
      return { ...state, message: action.payload, error: false }
    case 'ERROR':
      return { ...state, error: true }
    default:
      return state
  }
}, initialState, applyMiddleware(m))

m.done.then(() => console.log('initialized!'))
