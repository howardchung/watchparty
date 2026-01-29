import { FloatingPosition } from '../../../utils/Floating';
interface UseFloatingTooltip {
    offset: number;
    position: FloatingPosition;
    defaultOpened?: boolean;
}
export declare function useFloatingTooltip<T extends HTMLElement = any>({ offset, position, defaultOpened, }: UseFloatingTooltip): {
    handleMouseMove: ({ clientX, clientY }: MouseEvent | React.MouseEvent<T, MouseEvent>) => void;
    x: number;
    y: number;
    opened: boolean | undefined;
    setOpened: import("react").Dispatch<import("react").SetStateAction<boolean | undefined>>;
    boundaryRef: import("react").RefObject<T | null>;
    floating: ((node: HTMLElement | null) => void) & ((node: HTMLElement | null) => void);
};
export {};
