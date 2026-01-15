import type { MantineBreakpoint } from '../../MantineProvider';
export type BreakpointsSource = Record<MantineBreakpoint, number | string>;
export declare function getBreakpointValue(breakpoint: number | string, breakpoints: BreakpointsSource): number;
