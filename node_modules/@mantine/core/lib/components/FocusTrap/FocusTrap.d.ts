export interface FocusTrapProps {
    /** Element to trap focus at, must support ref prop */
    children: any;
    /** If set to `false`, disables focus trap */
    active?: boolean;
    /** Prop that is used to access element ref @default `'ref'` */
    refProp?: string;
    /** Ref to combine with the focus trap ref */
    innerRef?: React.ForwardedRef<any>;
}
export declare function FocusTrap({ children, active, refProp, innerRef, }: FocusTrapProps): React.ReactElement;
export declare namespace FocusTrap {
    var displayName: string;
    var InitialFocus: typeof FocusTrapInitialFocus;
}
export declare function FocusTrapInitialFocus(props: React.ComponentPropsWithoutRef<'span'>): import("react/jsx-runtime").JSX.Element;
export declare namespace FocusTrapInitialFocus {
    var displayName: string;
}
