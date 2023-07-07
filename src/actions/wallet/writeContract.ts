import type { Abi, ExtractAbiFunctionNames } from 'abitype'

import type { Account } from '../../accounts/types.js'
import type { Client } from '../../clients/createClient.js'
import type { Transport } from '../../clients/transports/createTransport.js'
import type { Chain } from '../../types/chain.js'
import type { Hex } from '../../types/misc.js'
import { encodeFunctionData } from '../../utils/abi/encodeFunctionData.js'

import type {
  ChainParameter,
  ContractFunctionParameters,
  PartialBy,
} from '../../types/contract2.js'
import {
  type SendTransactionParameters,
  type SendTransactionReturnType,
  sendTransaction,
} from './sendTransaction.js'

export type WriteContractParameters<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends abi extends Abi
    ? ExtractAbiFunctionNames<abi, 'nonpayable' | 'payable'>
    : string = abi extends Abi
    ? ExtractAbiFunctionNames<abi, 'nonpayable' | 'payable'>
    : string,
  clientChain extends Chain | undefined = Chain,
  account extends Account | undefined = undefined,
  chain extends Chain | undefined = undefined,
> = ContractFunctionParameters<abi, 'nonpayable' | 'payable', functionName> &
  ChainParameter<clientChain, chain> & {
    /** Data to append to the end of the calldata. Useful for adding a ["domain" tag](https://opensea.notion.site/opensea/Seaport-Order-Attributions-ec2d69bf455041a5baa490941aad307f). */
    dataSuffix?: Hex
  } extends infer type extends { args: unknown; chain: unknown }
  ? (undefined extends type['args'] ? true : false) &
      (undefined extends type['chain'] ? true : false) extends true
    ? PartialBy<
        type,
        | (undefined extends type['args'] ? 'args' : never)
        | (undefined extends type['chain'] ? 'chain' : never)
      >
    : type
  : never

// chain GetChain<TChain, TChainOverride>
// SendTransactionParameters UnionOmit<SendTransactionParameters<TChain, TAccount, TChainOverride>, 'chain' | 'to' | 'data' | 'value'>
// value
// TODO: Evaluate<> works with IDE autocomplete UI

export type WriteContractReturnType = SendTransactionReturnType

/**
 * Executes a write function on a contract.
 *
 * - Docs: https://viem.sh/docs/contract/writeContract.html
 * - Examples: https://stackblitz.com/github/wagmi-dev/viem/tree/main/examples/contracts/writing-to-contracts
 *
 * A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](https://viem.sh/docs/glossary/terms.html) is needed to be broadcast in order to change the state.
 *
 * Internally, uses a [Wallet Client](https://viem.sh/docs/clients/wallet.html) to call the [`sendTransaction` action](https://viem.sh/docs/actions/wallet/sendTransaction.html) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData.html).
 *
 * __Warning: The `write` internally sends a transaction – it does not validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `contract.simulate`](https://viem.sh/docs/contract/writeContract.html#usage) before you execute it.__
 *
 * @param client - Client to use
 * @param parameters - {@link WriteContractParameters}
 * @returns A [Transaction Hash](https://viem.sh/docs/glossary/terms.html#hash). {@link WriteContractReturnType}
 *
 * @example
 * import { createWalletClient, custom, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { writeContract } from 'viem/contract'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const hash = await writeContract(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
 *   functionName: 'mint',
 *   args: [69420],
 * })
 *
 * @example
 * // With Validation
 * import { createWalletClient, http, parseAbi } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { simulateContract, writeContract } from 'viem/contract'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 * const { request } = await simulateContract(client, {
 *   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
 *   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
 *   functionName: 'mint',
 *   args: [69420],
 * }
 * const hash = await writeContract(client, request)
 */
export async function writeContract<
  clientChain extends Chain | undefined,
  account extends Account | undefined,
  const abi extends Abi | readonly unknown[],
  functionName extends abi extends Abi
    ? ExtractAbiFunctionNames<abi, 'nonpayable' | 'payable'>
    : string,
  chain extends Chain | undefined = undefined,
>(
  client: Client<Transport, clientChain, account>,
  parameters: WriteContractParameters<
    abi,
    functionName,
    clientChain,
    account,
    chain
  >,
): Promise<WriteContractReturnType>

export async function writeContract(
  client: Client,
  parameters: WriteContractParameters,
): Promise<WriteContractReturnType> {
  const { abi, address, args, dataSuffix, functionName, ...request } =
    parameters
  const data = encodeFunctionData({ abi, args, functionName })
  const hash = await sendTransaction(client, {
    data: `${data}${dataSuffix ? dataSuffix.replace('0x', '') : ''}`,
    to: address,
    ...request,
  } as unknown as SendTransactionParameters) // TODO: Remove assertion
  return hash
}
