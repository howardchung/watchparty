export interface MenuTargetProps {
    /** Target element */
    children: React.ReactNode;
    /** Key of the prop used to get element ref @default `'ref'` */
    refProp?: string;
}
export declare const MenuTarget: import("react").ForwardRefExoticComponent<MenuTargetProps & import("react").RefAttributes<HTMLElement>>;
