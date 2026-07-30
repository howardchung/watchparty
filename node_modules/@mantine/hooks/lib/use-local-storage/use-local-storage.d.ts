import { UseStorageOptions } from './create-storage';
export declare function useLocalStorage<T = string>(props: UseStorageOptions<T>): import("./create-storage").UseStorageReturnValue<T>;
export declare const readLocalStorageValue: <T>({ key, defaultValue, deserialize, }: UseStorageOptions<T>) => T;
