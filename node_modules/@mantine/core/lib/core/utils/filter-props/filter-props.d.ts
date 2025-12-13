type FilterPropsRes<T extends Record<string, any>> = {
    [Key in keyof T]-?: T[Key] extends undefined ? never : T[Key];
};
export declare function filterProps<T extends Record<string, any>>(props: T): FilterPropsRes<T>;
export {};
