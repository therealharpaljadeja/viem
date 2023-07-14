import { beforeAll, expect, test } from 'vitest'

import { accounts } from '../../_test/constants.js'
import { testClient } from '../../_test/utils.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { reset } from '../../test.js'
import { optimism } from '../index.js'
import { getL1BlockBaseFee } from './getL1BlockBaseFee.js'

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

test('getL1BlockBaseFee', async () => {
  const baseFee = await getL1BlockBaseFee(client, { blockNumber })
  expect(baseFee).toMatchInlineSnapshot('15694378178n')
})
