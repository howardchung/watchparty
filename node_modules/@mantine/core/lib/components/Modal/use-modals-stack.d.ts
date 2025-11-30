interface ModalStackReturnType<T extends string> {
    state: Record<T, boolean>;
    open: (id: T) => void;
    close: (id: T) => void;
    toggle: (id: T) => void;
    closeAll: () => void;
    register: (id: T) => {
        opened: boolean;
        onClose: () => void;
        stackId: T;
    };
}
export declare function useModalsStack<const T extends string>(modals: T[]): ModalStackReturnType<T>;
export declare const useDrawersStack: typeof useModalsStack;
export {};
