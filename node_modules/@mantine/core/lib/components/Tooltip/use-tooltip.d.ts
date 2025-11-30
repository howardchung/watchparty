import { FloatingAxesOffsets, FloatingPosition, FloatingStrategy } from '../../utils/Floating';
import { type TooltipMiddlewares } from './Tooltip.types';
interface UseTooltip {
    position: FloatingPosition;
    closeDelay?: number;
    openDelay?: number;
    onPositionChange?: (position: FloatingPosition) => void;
    opened?: boolean;
    defaultOpened?: boolean;
    offset: number | FloatingAxesOffsets;
    arrowRef?: React.RefObject<HTMLDivElement | null>;
    arrowOffset?: number;
    events?: {
        hover: boolean;
        focus: boolean;
        touch: boolean;
    };
    positionDependencies: any[];
    inline?: boolean;
    strategy?: FloatingStrategy;
    middlewares?: TooltipMiddlewares;
}
export declare function useTooltip(settings: UseTooltip): {
    x: number;
    y: number;
    arrowX: number | undefined;
    arrowY: number | undefined;
    reference: ((node: import("@floating-ui/react-dom").ReferenceType | null) => void) & ((node: import("@floating-ui/react").ReferenceType | null) => void);
    floating: ((node: HTMLElement | null) => void) & ((node: HTMLElement | null) => void);
    getFloatingProps: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
    getReferenceProps: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>;
    isGroupPhase: any;
    opened: boolean | undefined;
    placement: import("@floating-ui/utils").Placement;
};
export {};
