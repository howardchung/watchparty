export interface MantineTransitionStyles {
    common?: React.CSSProperties;
    in: React.CSSProperties;
    out: React.CSSProperties;
    transitionProperty: React.CSSProperties['transitionProperty'];
}
export type MantineTransitionName = 'fade' | 'fade-down' | 'fade-up' | 'fade-left' | 'fade-right' | 'skew-up' | 'skew-down' | 'rotate-right' | 'rotate-left' | 'slide-down' | 'slide-up' | 'slide-right' | 'slide-left' | 'scale-y' | 'scale-x' | 'scale' | 'pop' | 'pop-top-left' | 'pop-top-right' | 'pop-bottom-left' | 'pop-bottom-right';
export type MantineTransition = MantineTransitionName | MantineTransitionStyles;
export declare const transitions: Record<MantineTransitionName, MantineTransitionStyles>;
