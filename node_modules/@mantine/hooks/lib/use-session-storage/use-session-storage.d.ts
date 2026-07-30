import { UseStorageOptions } from '../use-local-storage/create-storage';
export declare function useSessionStorage<T = string>(props: UseStorageOptions<T>): import("..").UseStorageReturnValue<T>;
export declare const readSessionStorageValue: <T>({ key, defaultValue, deserialize, }: UseStorageOptions<T>) => T;
