import { CssVariable } from '../../../../Box';
export type ResolvedVars = Partial<Record<string, Record<CssVariable, string | undefined>>>;
export declare function mergeVars(vars: (ResolvedVars | undefined)[]): Partial<Record<string, Record<`--${string}`, string | undefined>>>;
