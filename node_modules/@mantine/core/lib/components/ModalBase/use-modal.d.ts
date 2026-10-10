import { TransitionOverride } from '../Transition';
interface UseModalInput {
    opened: boolean;
    onClose: () => void;
    id: string | undefined;
    transitionProps: TransitionOverride | undefined;
    trapFocus: boolean | undefined;
    closeOnEscape: boolean | undefined;
    returnFocus: boolean | undefined;
}
export declare function useModal({ id, transitionProps, opened, trapFocus, closeOnEscape, onClose, returnFocus, }: UseModalInput): {
    _id: string;
    titleMounted: boolean;
    bodyMounted: boolean;
    shouldLockScroll: boolean;
    setTitleMounted: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    setBodyMounted: import("react").Dispatch<import("react").SetStateAction<boolean>>;
};
export {};
