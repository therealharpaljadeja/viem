import { getContract } from '../../actions/getContract.js'
import type { Client } from '../../clients/createClient.js'
import type { PublicClient } from '../../clients/createPublicClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import { type Chain } from '../index.js'
import { gasPriceOracleAbi } from './abis.js'

/**
 * Gets the contract instance for the [GasPriceOracle](https://optimistic.etherscan.io/address/0x420000000000000000000000000000000000000F) contract.
 *
 * @param client - Client to use
 * @returns GasPriceOracle contract
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { optimism } from 'viem/chains'
 * import { getGasPriceOracleContract } from 'viem/chains/optimism'
 *
 * const client = createPublicClient({
 *   chain: optimism,
 *   transport: http(),
 * })
 * const contract = getGasPriceOracleContract(client)
 * const baseFee = await contract.read.baseFee()
 */
export function getGasPriceOracleContract<TChain extends Chain | undefined,>(
  client: Client<Transport, TChain>,
) {
  return getContract({
    // TODO: Extract contract address from client
    address: '0x420000000000000000000000000000000000000F',
    abi: gasPriceOracleAbi,
    publicClient: client as PublicClient<Transport, any>,
  })
}
