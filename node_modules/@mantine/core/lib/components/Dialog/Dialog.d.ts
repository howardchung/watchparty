import { BoxProps, ElementProps, Factory, MantineSize, StylesApiProps } from '../../core';
import { AffixBaseProps } from '../Affix';
import { PaperBaseProps } from '../Paper';
import { TransitionOverride } from '../Transition';
export type DialogStylesNames = 'root' | 'closeButton';
export type DialogCssVariables = {
    root: '--dialog-size';
};
export interface DialogProps extends BoxProps, AffixBaseProps, PaperBaseProps, StylesApiProps<DialogFactory>, ElementProps<'div'> {
    /** If set, dialog is not unmounted from the DOM when hidden, `display: none` styles are applied instead */
    keepMounted?: boolean;
    /** If set, the close button is displayed @default `true` */
    withCloseButton?: boolean;
    /** Called when the close button is clicked */
    onClose?: () => void;
    /** Dialog content */
    children?: React.ReactNode;
    /** Opened state */
    opened: boolean;
    /** Props passed down to the underlying `Transition` component @default `{ transition: 'pop-top-right', duration: 200 }` */
    transitionProps?: TransitionOverride;
    /** Controls `width` of the dialog @default `'md'` */
    size?: MantineSize | (string & {}) | number;
}
export type DialogFactory = Factory<{
    props: DialogProps;
    ref: HTMLDivElement;
    stylesNames: DialogStylesNames;
    vars: DialogCssVariables;
}>;
export declare const Dialog: import("../..").MantineComponent<{
    props: DialogProps;
    ref: HTMLDivElement;
    stylesNames: DialogStylesNames;
    vars: DialogCssVariables;
}>;
