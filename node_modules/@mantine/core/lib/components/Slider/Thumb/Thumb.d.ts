import { TransitionOverride } from '../../Transition';
export interface ThumbProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'value'> {
    max: number;
    min: number;
    value: number;
    position: number;
    dragging: boolean;
    label: React.ReactNode;
    onKeyDownCapture?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    onMouseDown?: (event: any) => void;
    labelTransitionProps: TransitionOverride | undefined;
    labelAlwaysOn: boolean | undefined;
    thumbLabel: string | undefined;
    showLabelOnHover: boolean | undefined;
    isHovered?: boolean;
    children?: React.ReactNode;
    disabled: boolean | undefined;
    className?: string;
    style?: React.CSSProperties;
}
export declare const Thumb: import("react").ForwardRefExoticComponent<ThumbProps & import("react").RefAttributes<HTMLDivElement>>;
