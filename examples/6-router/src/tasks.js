import { taskCreator } from 'react-transact/redux'

export const changeColor = taskCreator('ERROR', 'COLOR_CHANGED', (color) => color)
