import {
  type ReadContractParameters,
  readContract,
} from '../../actions/public/readContract.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { type Chain } from '../index.js'
import { gasPriceOracleAbi } from './abis.js'

export type GetL1BaseFeeParameters = Pick<
  ReadContractParameters,
  'blockNumber' | 'blockTag'
>

/**
 * Gets the L1 block base fee as seen on the L2.
 *
 * - Docs: TODO
 *
 * @param client - Client to use
 * @param parameters - {@link EstimateL1GasParameters}
 * @returns The gas estimate. {@link EstimateL1GasReturnType}
 *
 * @example
 * import { createPublicClient, http, parseEther } from 'viem'
 * import { optimism } from 'viem/chains'
 * import { getL1BlockBaseFee } from 'viem/chains/optimism'
 *
 * const client = createPublicClient({
 *   chain: optimism,
 *   transport: http(),
 * })
 * const l1BaseFee = await getL1BlockBaseFee(client)
 */
export function getL1BlockBaseFee<TChain extends Chain | undefined>(
  client: Client<Transport, TChain>,
  args: GetL1BaseFeeParameters = {},
) {
  return readContract(client, {
    ...args,
    abi: gasPriceOracleAbi,
    // TODO: Extract contract address from client
    address: '0x420000000000000000000000000000000000000F',
    functionName: 'l1BaseFee',
  })
}
