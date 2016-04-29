const test = require('tape')
const h = require('../dist/helpers')

test('compact', (t) => {
  t.deepEqual(
    h.compact([null, 1, 2, undefined, false, null]),
    [1, 2, false],
    'removes nil values from array'
  )
  t.end()
})
