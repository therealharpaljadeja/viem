import { type Abi, type Address, type ResolvedConfig, parseAbi } from 'abitype'
import {
  wagmiMintExampleAbi,
  wagmiMintExampleHumanReadableAbi,
  writingEditionsFactoryAbi,
} from 'abitype/test'
import { assertType, expectTypeOf, test } from 'vitest'

import { publicClient } from '../../_test/utils.js'

import type { Evaluate, PartialBy } from '../../types/contract2.js'
import {
  type ReadContractParameters,
  type ReadContractReturnType,
  readContract,
} from './readContract.js'

test('args', () => {
  test('zero', async () => {
    const result = await readContract(publicClient, {
      address: '0x',
      abi: wagmiMintExampleAbi,
      functionName: 'name',
    })
    assertType<string>(result)
  })

  test('one', async () => {
    const result = await readContract(publicClient, {
      address: '0x',
      abi: wagmiMintExampleAbi,
      functionName: 'tokenURI',
      args: [123n],
    })
    assertType<string>(result)
  })

  test('two or more', async () => {
    const result = await readContract(publicClient, {
      address: '0x',
      abi: writingEditionsFactoryAbi,
      functionName: 'predictDeterministicAddress',
      args: ['0x', '0xfoo'],
    })
    assertType<ResolvedConfig['AddressType']>(result)
  })
})

test('return types', () => {
  test('string', async () => {
    const result = await readContract(publicClient, {
      address: '0x',
      abi: wagmiMintExampleAbi,
      functionName: 'name',
    })
    assertType<string>(result)
  })

  test('Address', async () => {
    const result = await readContract(publicClient, {
      address: '0x',
      abi: wagmiMintExampleAbi,
      functionName: 'ownerOf',
      args: [123n],
    })
    assertType<ResolvedConfig['AddressType']>(result)
  })

  test('number', async () => {
    const result = await readContract(publicClient, {
      address: '0x',
      abi: wagmiMintExampleAbi,
      functionName: 'balanceOf',
      args: ['0x'],
    })
    assertType<ResolvedConfig['BigIntType']>(result)
  })
})

test('behavior', () => {
  test('write function not allowed', async () => {
    const result = await readContract(publicClient, {
      address: '0x',
      abi: wagmiMintExampleAbi,
      // @ts-expect-error Trying to use non-read function
      functionName: 'approve',
    })
    assertType<unknown>(result)
  })

  test('without const assertion', async () => {
    const abi = [
      {
        name: 'foo',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string', name: '' }],
      },
      {
        name: 'bar',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ type: 'address', name: '' }],
        outputs: [{ type: 'address', name: '' }],
      },
    ]
    const result1 = await readContract(publicClient, {
      address: '0x',
      abi: abi,
      functionName: 'foo',
    })
    const result2 = await readContract(publicClient, {
      address: '0x',
      abi: abi,
      functionName: 'bar',
      args: ['0x'],
    })
    type Result1 = typeof result1
    type Result2 = typeof result2
    assertType<Result1>('hello')
    assertType<Result2>('0x123')
  })

  test('declared as Abi type', async () => {
    const abi: Abi = [
      {
        name: 'foo',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string', name: '' }],
      },
      {
        name: 'bar',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ type: 'address', name: '' }],
        outputs: [{ type: 'address', name: '' }],
      },
    ]
    const result1 = await readContract(publicClient, {
      address: '0x',
      abi: abi,
      functionName: 'foo',
    })
    const result2 = await readContract(publicClient, {
      address: '0x',
      abi: abi,
      functionName: 'bar',
      args: ['0x'],
    })
    type Result1 = typeof result1
    type Result2 = typeof result2
    assertType<Result1>('hello')
    assertType<Result2>('0x123')
  })

  test('defined inline', async () => {
    const result1 = await readContract(publicClient, {
      address: '0x',
      abi: [
        {
          name: 'foo',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'string', name: '' }],
        },
        {
          name: 'bar',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ type: 'address', name: '' }],
          outputs: [{ type: 'address', name: '' }],
        },
      ],
      functionName: 'foo',
    })
    const result2 = await readContract(publicClient, {
      address: '0x',
      abi: [
        {
          name: 'foo',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'string', name: '' }],
        },
        {
          name: 'bar',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ type: 'address', name: '' }],
          outputs: [{ type: 'address', name: '' }],
        },
      ],
      functionName: 'bar',
      args: ['0x'],
    })
    type Result1 = typeof result1
    type Result2 = typeof result2
    assertType<Result1>('hello')
    assertType<Result2>('0x123')
  })

  test('human readable', async () => {
    const result = await readContract(publicClient, {
      address: '0x',
      abi: parseAbi(wagmiMintExampleHumanReadableAbi),
      functionName: 'balanceOf',
      args: ['0x'],
    })
    assertType<bigint>(result)
  })

  test('overloads', async () => {
    const abi = parseAbi([
      'function foo() returns (bool)',
      'function foo(string) returns (uint8)',
      'function foo(uint) view returns (address)',
      'function foo(address) view returns (uint256)',
      'function foo(uint256, address) view returns (address, uint8)',
      'function bar() view returns (bool)',
      'function baz(string) view returns (bool)',
    ])

    const result = await readContract(publicClient, {
      address: '0x',
      abi,
      functionName: 'foo',
      args: [123n, '0x'],
    })
    assertType<readonly [Address, number]>(result)
  })
})

test('ReadContractParameters', () => {
  test('without const assertion', () => {
    const abi = [
      {
        name: 'foo',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string', name: '' }],
      },
      {
        name: 'bar',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ type: 'address', name: '' }],
        outputs: [{ type: 'address', name: '' }],
      },
    ]
    type Result = Pick<
      ReadContractParameters<typeof abi, 'foo', readonly []>,
      'abi' | 'functionName' | 'args'
    >
    expectTypeOf<Result>().toEqualTypeOf<{
      abi: typeof abi
      functionName: string
      args?: readonly unknown[] | undefined
    }>()
  })

  test('declared as Abi type', () => {
    type Result = Pick<
      ReadContractParameters<Abi>,
      'abi' | 'functionName' | 'args'
    >
    expectTypeOf<Result>().toEqualTypeOf<{
      abi: Abi
      functionName: string
      args?: readonly unknown[] | undefined
    }>()
  })

  test('zero args', () => {
    type Result = Pick<
      ReadContractParameters<typeof wagmiMintExampleAbi, 'name', readonly []>,
      'abi' | 'functionName' | 'args'
    >
    expectTypeOf<Result>().toEqualTypeOf<{
      abi: typeof wagmiMintExampleAbi
      functionName:
        | 'symbol'
        | 'name'
        | 'balanceOf'
        | 'getApproved'
        | 'isApprovedForAll'
        | 'ownerOf'
        | 'supportsInterface'
        | 'tokenURI'
        | 'totalSupply'
      args?: readonly [] | undefined
    }>()
  })

  test('more than one arg', () => {
    type Result = Pick<
      ReadContractParameters<
        typeof writingEditionsFactoryAbi,
        'predictDeterministicAddress',
        readonly ['0x', '0xfoo']
      >,
      'abi' | 'functionName' | 'args'
    >
    type Expected = {
      abi: typeof writingEditionsFactoryAbi
      functionName:
        | 'predictDeterministicAddress'
        | 'owner'
        | 'implementation'
        | 'CREATE_TYPEHASH'
        | 'DOMAIN_SEPARATOR'
        | 'VERSION'
        | 'baseDescriptionURI'
        | 'getSalt'
        | 'guardOn'
        | 'isNextOwner'
        | 'isOwner'
        | 'isValid'
        | 'maxLimit'
        | 'o11y'
        | 'salts'
        | 'treasuryConfiguration'
      args: readonly [Address, ResolvedConfig['BytesType']['inputs']]
    }
    expectTypeOf<Result>().toEqualTypeOf<Expected>()

    // can transform multiple times and type stays the same
    expectTypeOf<
      Pick<
        Required<PartialBy<Evaluate<Result>, 'abi'>>,
        'abi' | 'functionName' | 'args'
      >
    >().toEqualTypeOf<Expected>()
  })
})

test('ReadContractReturnType', () => {
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
    type Result = ReadContractReturnType<typeof abi, 'foo', readonly []>
    expectTypeOf<Result>().toEqualTypeOf<unknown>()
  })

  test('declared as Abi type', () => {
    type Result = ReadContractReturnType<Abi>
    expectTypeOf<Result>().toEqualTypeOf<unknown>()
  })

  test('zero args', () => {
    type Result = ReadContractReturnType<
      typeof wagmiMintExampleAbi,
      'name',
      readonly []
    >
    expectTypeOf<Result>().toEqualTypeOf<string>()
  })

  test('more than one arg', () => {
    type Result = ReadContractReturnType<
      typeof writingEditionsFactoryAbi,
      'predictDeterministicAddress',
      readonly ['0x', '0xfoo']
    >
    expectTypeOf<Result>().toEqualTypeOf<`0x${string}`>()
  })
})
