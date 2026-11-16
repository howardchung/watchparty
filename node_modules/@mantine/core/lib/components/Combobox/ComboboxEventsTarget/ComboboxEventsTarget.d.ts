import { Factory } from '../../../core';
export interface ComboboxEventsTargetProps {
    /** Target element */
    children: React.ReactNode;
    /** Key of the prop is used to access element ref */
    refProp?: string;
    /** If set, the component responds to the keyboard events @default `true` */
    withKeyboardNavigation?: boolean;
    /** If set, the target has `aria-` attributes @default `true` */
    withAriaAttributes?: boolean;
    /** If set, the target has `aria-expanded` attribute @default `false` */
    withExpandedAttribute?: boolean;
    /** Determines which events should be handled by the target element.
     * `button` target type handles `Space` and `Enter` keys to toggle dropdown opened state.
     * @default `input`
     * */
    targetType?: 'button' | 'input';
    /** Input autocomplete attribute */
    autoComplete?: string;
}
export type ComboboxEventsTargetFactory = Factory<{
    props: ComboboxEventsTargetProps;
    ref: HTMLElement;
    compound: true;
}>;
export declare const ComboboxEventsTarget: import("../../..").MantineComponent<{
    props: ComboboxEventsTargetProps;
    ref: HTMLElement;
    compound: true;
}>;
