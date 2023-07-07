import { type Address, type ResolvedConfig, parseAbi } from 'abitype'
import { expectTypeOf, test } from 'vitest'

import {
  type ContractFunctionParameters,
  type ContractFunctionReturnType,
  type Evaluate,
  type IsReadonlyArray,
  type IsUnion,
  type UnionToTuple,
  type WidenPrimitiveType,
} from './contract2.js'

const abi = parseAbi([
  'function foo() returns (bool)',
  'function foo(bool) returns (uint8)',
  'function foo(uint) view returns (address)',
  'function foo(address) view returns (uint256)',
  'function foo(uint256, address) view returns (address, uint8)',
  'function bar() view returns (bool)',
  'function baz(string) view returns (bool)',
])

test('ContractFunctionParameters', () => {
  type Params = Evaluate<
    Evaluate<
      ContractFunctionParameters<
        typeof abi,
        'pure' | 'view',
        'foo',
        readonly [bigint, Address]
      >
    >
  >

  expectTypeOf<Params>().toMatchTypeOf<{
    abi: typeof abi
    functionName: 'foo' | 'bar' | 'baz'
    args:
      | readonly [`0x${string}`]
      | readonly [bigint, `0x${string}`]
      | readonly [bigint]
  }>()

  // Supports partializing
  expectTypeOf<Partial<Params>>().toMatchTypeOf<{
    abi?: typeof abi
    functionName?: 'foo' | 'bar' | 'baz'
    args?:
      | readonly [`0x${string}`]
      | readonly [bigint, `0x${string}`]
      | readonly [bigint]
  }>()

  // Supports omitting
  expectTypeOf<Omit<Params, 'address'>>().toMatchTypeOf<{
    abi: typeof abi
    functionName: 'foo' | 'bar' | 'baz'
    args:
      | readonly [`0x${string}`]
      | readonly [bigint, `0x${string}`]
      | readonly [bigint]
  }>()
})

test('ContractFunctionReturnType', () => {
  expectTypeOf<
    ContractFunctionReturnType<typeof abi, 'pure' | 'view', 'foo'>
  >().toEqualTypeOf<bigint | Address | readonly [Address, number]>()
  expectTypeOf<
    ContractFunctionReturnType<typeof abi, 'pure' | 'view', 'foo', [123n]>
  >().toEqualTypeOf<Address>()
})

test('WidenPrimitiveType', () => {
  expectTypeOf<WidenPrimitiveType<123n>>().toEqualTypeOf<bigint>()

  expectTypeOf<WidenPrimitiveType<true>>().toEqualTypeOf<boolean>()

  expectTypeOf<WidenPrimitiveType<123>>().toEqualTypeOf<number>()

  expectTypeOf<WidenPrimitiveType<'foo'>>().toEqualTypeOf<string>()
  expectTypeOf<WidenPrimitiveType<'0x'>>().toEqualTypeOf<Address>()
  expectTypeOf<WidenPrimitiveType<'0x'>>().toEqualTypeOf<
    ResolvedConfig['BytesType']['inputs']
  >()

  expectTypeOf<WidenPrimitiveType<['foo']>>().toEqualTypeOf<readonly [string]>()
  expectTypeOf<WidenPrimitiveType<['0x']>>().toEqualTypeOf<readonly [Address]>()
  expectTypeOf<WidenPrimitiveType<['foo', '0x']>>().toEqualTypeOf<
    readonly [string, Address]
  >()
  expectTypeOf<WidenPrimitiveType<true>>().toEqualTypeOf<boolean>()
  expectTypeOf<WidenPrimitiveType<[true]>>().toEqualTypeOf<readonly [boolean]>()

  expectTypeOf<WidenPrimitiveType<readonly ['foo']>>().toEqualTypeOf<
    readonly [string]
  >()
})

test('IsReadonlyArray', () => {
  expectTypeOf<IsReadonlyArray<123>>().toEqualTypeOf<false>()

  expectTypeOf<IsReadonlyArray<[123]>>().toEqualTypeOf<true>()
  expectTypeOf<IsReadonlyArray<readonly [123]>>().toEqualTypeOf<true>()
  expectTypeOf<IsReadonlyArray<readonly [123, 456]>>().toEqualTypeOf<true>()

  expectTypeOf<IsReadonlyArray<string[]>>().toEqualTypeOf<false>()
  expectTypeOf<IsReadonlyArray<(string | number)[]>>().toEqualTypeOf<false>()
})

test('IsUnion', () => {
  expectTypeOf<IsUnion<123>>().toEqualTypeOf<false>()
  expectTypeOf<IsUnion<123 | 456>>().toEqualTypeOf<true>()
})

test('UnionToTuple', () => {
  expectTypeOf<UnionToTuple<123>>().toEqualTypeOf<[123]>()
  expectTypeOf<UnionToTuple<123 | 456>>().toEqualTypeOf<[123, 456]>()
  expectTypeOf<UnionToTuple<123 | 456 | 789>>().toEqualTypeOf<[123, 456, 789]>()
})
