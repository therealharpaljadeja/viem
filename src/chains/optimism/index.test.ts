import { expect, test } from 'vitest'

import * as actions from './index.js'

test('exports', () => {
  expect(Object.keys(actions)).toMatchInlineSnapshot(`
    [
      "optimism",
      "optimismGoerli",
      "estimateL1Gas",
      "getL1BlockBaseFee",
      "formattersOptimism",
    ]
  `)
})
