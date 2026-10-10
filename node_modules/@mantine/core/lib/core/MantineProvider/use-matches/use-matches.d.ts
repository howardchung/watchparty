import { UseMediaQueryOptions } from '@mantine/hooks';
import { MantineBreakpoint } from '../theme.types';
type UseMatchesInput<T> = Partial<Record<MantineBreakpoint, T>>;
export declare function useMatches<T>(payload: UseMatchesInput<T>, options?: UseMediaQueryOptions): T;
export {};
