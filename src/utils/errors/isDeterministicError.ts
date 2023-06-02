import { HttpRequestError } from '../../errors/request.js'

export function isDeterministicContractError(error: Error) {
  if (!('code' in error)) return false
  return (
    error.code !== -1 &&
    error.code !== -32004 &&
    error.code !== -32005 &&
    error.code !== -32042 &&
    error.code !== -32603
  )
}

export function isDeterministicHttpError(error: Error) {
  if (!(error instanceof HttpRequestError && error.status)) return false
  return (
    error.status !== 403 &&
    error.status !== 408 &&
    error.status !== 413 &&
    error.status !== 429 &&
    error.status !== 500 &&
    error.status !== 502 &&
    error.status !== 503 &&
    error.status !== 504
  )
}
