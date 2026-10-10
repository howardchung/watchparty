export type UseOSReturnValue = 'undetermined' | 'macos' | 'ios' | 'windows' | 'android' | 'linux' | 'chromeos';
export interface UseOsOptions {
    getValueInEffect: boolean;
}
export declare function useOs(options?: UseOsOptions): UseOSReturnValue;
