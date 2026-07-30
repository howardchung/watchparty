export declare function useProps<T extends Record<string, any>, U extends Partial<T> | null = {}>(component: string, defaultProps: U, props: T): T & (U extends null | undefined ? {} : {
    [Key in Extract<keyof T, keyof U>]-?: U[Key] | NonNullable<T[Key]>;
});
