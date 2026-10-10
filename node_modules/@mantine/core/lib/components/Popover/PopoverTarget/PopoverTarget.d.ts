import { Factory } from '../../../core';
export interface PopoverTargetProps {
    /** Target element */
    children: React.ReactNode;
    /** Key of the prop that should be used to access element ref */
    refProp?: string;
    /** Popup accessible type @default `'dialog'` */
    popupType?: string;
}
export type PopoverTargetFactory = Factory<{
    props: PopoverTargetProps;
    ref: HTMLElement;
    compound: true;
}>;
export declare const PopoverTarget: import("../../..").MantineComponent<{
    props: PopoverTargetProps;
    ref: HTMLElement;
    compound: true;
}>;
