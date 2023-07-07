import type { Abi, Address } from 'abitype'
import { seaportAbi, wagmiMintExampleAbi } from 'abitype/test'
import { expectTypeOf, test } from 'vitest'

import { wagmiContractConfig } from '../../_test/abis.js'
import {
  walletClient,
  walletClientWithAccount,
  walletClientWithoutChain,
} from '../../_test/utils.js'
import { mainnet } from '../../chains/index.js'
import type { Evaluate, PartialBy } from '../../types/contract2.js'
import { type WriteContractParameters, writeContract } from './writeContract.js'

const args = {
  ...wagmiContractConfig,
  functionName: 'mint',
  args: [69420n],
} as const

test('legacy', () => {
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'legacy',
  })
})

test('eip1559', () => {
  writeContract(walletClientWithAccount, {
    ...args,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip1559',
  })
  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    gasPrice: 0n,
    type: 'eip1559',
  })
})

test('eip2930', () => {
  writeContract(walletClientWithAccount, {
    ...args,
    accessList: [],
    gasPrice: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
  })

  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    accessList: [],
    gasPrice: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
  // @ts-expect-error
  writeContract(walletClientWithAccount, {
    ...args,
    accessList: [],
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    type: 'eip2930',
  })
})

test('WriteContractParameters', () => {
  test('without const assertion', () => {
    const abi = [
      {
        name: 'foo',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [],
        outputs: [{ type: 'string', name: '' }],
      },
      {
        name: 'bar',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ type: 'address', name: '' }],
        outputs: [{ type: 'address', name: '' }],
      },
    ]
    type Result = WriteContractParameters<typeof abi, 'foo'>
    expectTypeOf<Result>().toMatchTypeOf<{
      abi: typeof abi
      functionName: string
      args?: readonly unknown[] | undefined
    }>()
  })

  test('declared as Abi type', () => {
    type Result = WriteContractParameters<Abi>
    expectTypeOf<Result>().toMatchTypeOf<{
      abi: Abi
      functionName: string
      args?: readonly unknown[] | undefined
    }>()
  })

  test('zero args', () => {
    type Result = WriteContractParameters<typeof wagmiMintExampleAbi, 'mint'>
    expectTypeOf<Result>().toMatchTypeOf<{
      abi: typeof wagmiMintExampleAbi
      functionName:
        | 'approve'
        | 'mint'
        | 'safeTransferFrom'
        | 'setApprovalForAll'
        | 'transferFrom'
      args?: readonly [] | undefined
    }>()
  })

  test('more than one arg', () => {
    type Result = WriteContractParameters<typeof seaportAbi, 'cancel'>
    type Expected = {
      abi: typeof seaportAbi
      functionName:
        | 'cancel'
        | 'fulfillAdvancedOrder'
        | 'fulfillAvailableAdvancedOrders'
        | 'fulfillAvailableOrders'
        | 'fulfillBasicOrder'
        | 'fulfillBasicOrder_efficient_6GL6yc'
        | 'fulfillOrder'
        | 'incrementCounter'
        | 'matchAdvancedOrders'
        | 'matchOrders'
        | 'validate'
      args: readonly [
        readonly {
          offerer: Address
          zone: Address
          offer: readonly {
            itemType: number
            token: Address
            identifierOrCriteria: bigint
            startAmount: bigint
            endAmount: bigint
          }[]
          consideration: readonly {
            itemType: number
            token: Address
            identifierOrCriteria: bigint
            startAmount: bigint
            endAmount: bigint
            recipient: Address
          }[]
          counter: bigint
          orderType: number
          startTime: bigint
          endTime: bigint
          salt: bigint
          conduitKey: Address
          zoneHash: Address
        }[],
      ]
    }
    expectTypeOf<Result>().toMatchTypeOf<Expected>()

    // can transform multiple times and type stays the same
    expectTypeOf<
      Pick<
        Required<PartialBy<Evaluate<Result>, 'abi'>>,
        'abi' | 'functionName' | 'args'
      >
    >().toEqualTypeOf<Expected>()
  })
})

const res = writeContract(walletClient, {
  ...wagmiContractConfig,
  functionName: 'mint',
  args: [69420n],
  chain: mainnet,
  // ^?
})

// walletClient
// walletClientWithoutChain

const res = writeContract(walletClient, {
  ...wagmiContractConfig,
  chain: mainnet,
  functionName: 'mint',
  args: [69420n],
})
const res2 = writeContract(walletClientWithoutChain, {
  ...wagmiContractConfig,
  chain: mainnet,
  functionName: 'mint',
  args: [69420n],
})
