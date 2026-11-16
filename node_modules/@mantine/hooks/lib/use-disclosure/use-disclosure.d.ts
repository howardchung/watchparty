export interface UseDisclosureOptions {
    onOpen?: () => void;
    onClose?: () => void;
}
export interface UseDisclosureHandlers {
    open: () => void;
    close: () => void;
    toggle: () => void;
}
export type UseDisclosureReturnValue = [boolean, UseDisclosureHandlers];
export declare function useDisclosure(initialState?: boolean, options?: UseDisclosureOptions): UseDisclosureReturnValue;
