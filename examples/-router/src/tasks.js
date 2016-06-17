import { taskCreator } from 'react-transact'

export const changeColor = taskCreator('ERROR', 'COLOR_CHANGED', (color) => color)
