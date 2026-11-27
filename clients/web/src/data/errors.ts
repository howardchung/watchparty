export class ApiError extends Error {
  constructor(public code: string, public status = 0, public activePartyCode?: string) { super(code); }
}
