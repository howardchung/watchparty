import { Factory } from '../../../core';
export interface ComboboxDropdownTargetProps {
    /** Target element */
    children: React.ReactNode;
    /** Key of the prop that should be used to access element ref */
    refProp?: string;
}
export type ComboboxDropdownTargetFactory = Factory<{
    props: ComboboxDropdownTargetProps;
    ref: HTMLElement;
    compound: true;
}>;
export declare const ComboboxDropdownTarget: import("../../..").MantineComponent<{
    props: ComboboxDropdownTargetProps;
    ref: HTMLElement;
    compound: true;
}>;
