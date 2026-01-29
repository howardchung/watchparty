import _fetch, {
  Blob as _Blob,
  File as _File,
  FormData as _FormData,
  Headers as _Headers,
  Request as _Request,
  Response as _Response
} from 'node-fetch'

export const fetch = global.fetch || _fetch
export default fetch

export const Blob = global.Blob || _Blob
export const File = global.File || _File
export const FormData = global.FormData || _FormData
export const Headers = global.Headers || _Headers
export const Request = global.Request || _Request
export const Response = global.Response || _Response
export const AbortController = global.AbortController
export const AbortSignal = global.AbortSignal

export {
  AbortError,
  FetchError,
  blobFrom,
  blobFromSync,
  fileFrom,
  fileFromSync,
  isRedirect
} from 'node-fetch'
