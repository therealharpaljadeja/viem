import { beforeAll, expect, test } from 'vitest'

import { accounts } from '../../../_test/constants.js'
import { testClient } from '../../../_test/utils.js'
import { createClient } from '../../../clients/createClient.js'
import { http } from '../../../clients/transports/http.js'
import { reset } from '../../../test.js'
import { parseEther } from '../../../utils/unit/parseEther.js'
import { optimism } from '../../index.js'
import { estimateL1Gas } from './estimateL1Gas.js'

const blockNumber = 106812538n
const client = createClient({
  account: accounts[0].address,
  chain: optimism,
  transport: http(),
})

beforeAll(async () => {
  await reset(testClient, {
    blockNumber,
    jsonRpcUrl: process.env.VITE_ANVIL_FORK_URL_OPTIMISM,
  })
})

test('default', async () => {
  const gas = await estimateL1Gas(client, {
    gas: 69420n,
    to: accounts[1].address,
    value: parseEther('1'),
  })
  expect(gas).toMatchInlineSnapshot('2040n')
})
