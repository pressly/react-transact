import { createStore } from 'redux'

export default (initialState = {}) => createStore((state = {}, action) => {
  switch (action.type) {
    case 'COLOR_CHANGED':
        return { ...state, color: action.payload, error: false }
    case 'NAME_CHANGED':
      return { ...state, name: action.payload, error: false }
    case 'ECHO':
      return { ...state, what: action.payload, error: false }
    case 'ERROR':
      return { ...state, error: true }
    default:
      return state
  }
}, initialState)
