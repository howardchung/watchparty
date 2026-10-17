import { Factory } from '../../../core';
export interface ComboboxTargetProps {
    /** Target element */
    children: React.ReactNode;
    /** Key of the prop that is used to access element ref */
    refProp?: string;
    /** If set, the component responds to keyboard events @default `true` */
    withKeyboardNavigation?: boolean;
    /** If set, the target has `aria-` attributes @default `true` */
    withAriaAttributes?: boolean;
    /** If set, the target has `aria-expanded` attribute @default `false` */
    withExpandedAttribute?: boolean;
    /** Determines which events is handled by the target element.
     * `button` target type handles `Space` and `Enter` keys to toggle dropdown opened state.
     * @default `input`
     * */
    targetType?: 'button' | 'input';
    /** Input autocomplete attribute */
    autoComplete?: string;
}
export type ComboboxTargetFactory = Factory<{
    props: ComboboxTargetProps;
    ref: HTMLElement;
    compound: true;
}>;
export declare const ComboboxTarget: import("../../..").MantineComponent<{
    props: ComboboxTargetProps;
    ref: HTMLElement;
    compound: true;
}>;
