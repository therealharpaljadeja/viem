import type { Chain } from './chain.js'
import {
  type Abi,
  type AbiFunction,
  type AbiParameter,
  type AbiParametersToPrimitiveTypes,
  type AbiStateMutability,
  type Address,
  type ExtractAbiFunction,
  type ExtractAbiFunctionNames,
  type ResolvedConfig,
} from 'abitype'

export type ContractFunctionParameters<
  abi extends Abi | readonly unknown[] = Abi,
  abiStateMutability extends AbiStateMutability = AbiStateMutability,
  functionName extends abi extends Abi
    ? ExtractAbiFunctionNames<abi, abiStateMutability>
    : string = abi extends Abi
    ? ExtractAbiFunctionNames<abi, abiStateMutability>
    : string,
  args extends abi extends Abi
    ? AbiParametersToPrimitiveTypes<
        ExtractAbiFunction<abi, functionName, abiStateMutability>['inputs'],
        'inputs'
      >
    : readonly unknown[] = any,
  ///
  functionNames extends string = abi extends Abi
    ? ExtractAbiFunctionNames<abi, abiStateMutability>
    : string,
  abiFunction extends AbiFunction = abi extends Abi
    ? ExtractAbiFunction<abi, functionName, abiStateMutability>
    : AbiFunction,
  primitiveTypes = AbiParametersToPrimitiveTypes<
    abiFunction['inputs'],
    'inputs'
  >,
> = {
  abi: abi // narrow inline `abi` type
  address: Address
} & {
  // `functionName` must be in separate object than `abi` (for IDE autocomplete expansion)
  functionName:
    | functionName // infer value
    | functionNames // show all values
    | (Abi extends abi ? string : never) // fallback if `abi` is declared as `Abi`
} & {
  // `args` must be in separate object than `functionName` (for IDE autocomplete expansion)
  args:
    | (args extends readonly [] // disallow `args: []`
        ? never
        : IsReadonlyArray<args> extends true // `args` not inline or const asserted
        ? WidenPrimitiveType<args> // infer value and `args` match `primitiveTypes` (e.g. avoid union `(property) args: readonly [123n] | readonly [bigint]`, should be `(property) args: readonly [bigint]` instead)
        : never)
    | primitiveTypes // show all values
    | (primitiveTypes extends readonly [] ? readonly [] | undefined : never) // function has no inputs
    | (Abi extends abi ? readonly unknown[] | undefined : never) // `abi` declared as `Abi`
    | (abi extends Abi ? never : readonly unknown[] | undefined) // `abi` not const asserted
}

export type ContractFunctionReturnType<
  abi extends Abi | readonly unknown[] = Abi,
  abiStateMutability extends AbiStateMutability = AbiStateMutability,
  functionName extends abi extends Abi
    ? ExtractAbiFunctionNames<abi, abiStateMutability>
    : string = abi extends Abi
    ? ExtractAbiFunctionNames<abi, abiStateMutability>
    : string,
  args extends abi extends Abi
    ? AbiParametersToPrimitiveTypes<
        ExtractAbiFunction<abi, functionName, abiStateMutability>['inputs'],
        'inputs'
      >
    : readonly unknown[] = any,
  ///
  abiFunction extends AbiFunction = (
    abi extends Abi
      ? ExtractAbiFunction<abi, functionName, abiStateMutability>
      : AbiFunction
  ) extends infer abiFunction_ extends AbiFunction
    ? unknown extends args
      ? abiFunction_
      : IsUnion<abiFunction_> extends true // narrow overloads using `args` by converting to tuple and filtering out overloads that don't match
      ? UnionToTuple<abiFunction_> extends infer abiFunctions extends readonly AbiFunction[]
        ? {
            [K in
              keyof abiFunctions]: args extends AbiParametersToPrimitiveTypes<
              abiFunctions[K]['inputs'],
              'inputs'
            >
              ? abiFunctions[K]
              : never
          }[number] // convert back to union (removes `never` tuple entries: `['foo', never, 'bar'][number]` => `'foo' | 'bar'`)
        : never
      : abiFunction_
    : never,
  outputs extends readonly AbiParameter[] = abiFunction['outputs'],
  primitiveTypes extends readonly unknown[] = AbiParametersToPrimitiveTypes<
    outputs,
    'outputs'
  >,
  // > = args
> = [abiFunction] extends [never]
  ? unknown // `abiFunction` was not inferrable (e.g. `abi` declared as `Abi`)
  : readonly unknown[] extends primitiveTypes
  ? unknown // `abiFunction` was not inferrable (e.g. `abi` not const asserted)
  : primitiveTypes extends readonly [] // unwrap `primitiveTypes`
  ? void // no outputs
  : primitiveTypes extends readonly [infer primitiveType]
  ? primitiveType // single output
  : primitiveTypes

export type ChainParameter<
  clientChain extends Chain | undefined,
  chain extends Chain | undefined = undefined,
> = PartialBy<
  {
    chain: (chain extends Chain ? chain : never) | Chain
  },
  [undefined] extends [clientChain] ? never : 'chain'
>

/////////////////////////////////////////////////////////////////////////////////////

export type WidenPrimitiveType<type> =
  | (type extends Function ? type : never)
  | (type extends ResolvedConfig['BigIntType'] ? bigint : never)
  | (type extends boolean ? boolean : never)
  | (type extends ResolvedConfig['IntType'] ? number : never)
  | (type extends string
      ? type extends Address
        ? Address
        : type extends ResolvedConfig['BytesType']['inputs']
        ? ResolvedConfig['BytesType']
        : string
      : never)
  | (type extends readonly [] ? readonly [] : never)
  | (type extends Record<string, unknown>
      ? { [K in keyof type]: WidenPrimitiveType<type[K]> }
      : never)
  | (type extends { length: number }
      ? {
          [K in keyof type]: WidenPrimitiveType<type[K]>
        } extends infer Val extends readonly unknown[]
        ? readonly [...Val]
        : never
      : never)

export type IsReadonlyArray<type> = type extends readonly (infer item)[]
  ? item[] extends type
    ? false
    : true
  : false

export type IsUnion<
  type,
  ///
  type2 = type,
> = type extends type2 ? ([type2] extends [type] ? false : true) : never

export type UnionToTuple<
  union,
  ///
  last = LastInUnion<union>,
> = [union] extends [never] ? [] : [...UnionToTuple<Exclude<union, last>>, last]
type LastInUnion<U> = UnionToIntersection<
  U extends unknown ? (x: U) => 0 : never
> extends (x: infer l) => 0
  ? l
  : never
type UnionToIntersection<union> = (
  union extends unknown
    ? (arg: union) => 0
    : never
) extends (arg: infer i) => 0
  ? i
  : never

export type Evaluate<type> = { [key in keyof type]: type[key] } & unknown

export type ExactPartial<type> = { [key in keyof type]?: type[key] | undefined }

export type PartialBy<type, key extends keyof type> = ExactPartial<
  Pick<type, key>
> &
  Omit<type, key>

export type PrettifyFlat<T> = T extends infer U
  ? { [K in keyof U]: U[K] }
  : never

type PickUndefinedAndConvertToOptional<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<
    T[K],
    undefined
  >
}

type PickNonUndefined<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K]
}

export type UndefinedFieldsToOptional<T> = PrettifyFlat<
  { [K in keyof T]?: unknown } & PickUndefinedAndConvertToOptional<T> &
    PickNonUndefined<T>
>

export type OneOf<
  Union extends object,
  AllKeys extends KeyofUnion<Union> = KeyofUnion<Union>,
> = Union extends infer Item
  ? Evaluate<Item & { [K in Exclude<AllKeys, keyof Item>]?: never }>
  : never
type KeyofUnion<T> = T extends T ? keyof T : never
