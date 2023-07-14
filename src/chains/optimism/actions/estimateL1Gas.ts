import type { EstimateGasParameters } from '../../../actions/public/estimateGas.js'
import { readContract } from '../../../actions/public/readContract.js'
import type { Client } from '../../../clients/createClient.js'
import type { Transport } from '../../../clients/transports/createTransport.js'
import { assertRequest, hexToNumber, prepareRequest } from '../../../index.js'
import type { Account } from '../../../types/account.js'
import { serializeTransaction } from '../../../utils/transaction/serializeTransaction.js'
import { type Chain } from '../../index.js'
import { gasPriceOracleAbi } from '../abis.js'

export type EstimateL1GasParameters<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined = Account | undefined,
> = EstimateGasParameters<TChain, TAccount>

export type EstimateL1GasReturnType = bigint

/**
 * Estimates the amount of L1 gas required to execute an L2 transaction.
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
 * import { estimateL1Gas } from 'viem/chains/optimism'
 *
 * const client = createPublicClient({
 *   chain: optimism,
 *   transport: http(),
 * })
 * const l1Gas = await estimateL1Gas(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *   value: parseEther('1'),
 * })
 */
export async function estimateL1Gas<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
>(
  client: Client<Transport, TChain, TAccount>,
  args: EstimateL1GasParameters<TChain, TAccount>,
): Promise<EstimateL1GasReturnType> {
  const [chainId, request] = await Promise.all([
    client.request({ method: 'eth_chainId' }),
    prepareRequest(client, {
      ...args,
      account: args.account || client.account,
    }),
  ])

  assertRequest(request)

  const transaction = serializeTransaction({
    ...request,
    chainId: hexToNumber(chainId),
  })
  return readContract(client, {
    abi: gasPriceOracleAbi,
    // TODO: Extract contract address from client
    address: '0x420000000000000000000000000000000000000F',
    functionName: 'getL1GasUsed',
    args: [transaction],
  })
}
