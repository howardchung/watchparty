export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly activePartyCode?: string;
  constructor(status: number, code: string, message = code, activePartyCode?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.activePartyCode = activePartyCode;
  }
}
