import { BoxProps, ElementProps, Factory, MantineSize, StylesApiProps } from '../../../core';
import { CloseButtonStylesNames } from '../../CloseButton';
export interface InputClearButtonProps extends BoxProps, StylesApiProps<InputClearButtonFactory>, ElementProps<'button'> {
    /** Size of the button, by default value is based on input context */
    size?: MantineSize | (string & {});
}
export type InputClearButtonFactory = Factory<{
    props: InputClearButtonProps;
    ref: HTMLButtonElement;
    stylesNames: CloseButtonStylesNames;
}>;
export declare const InputClearButton: import("../../..").MantineComponent<{
    props: InputClearButtonProps;
    ref: HTMLButtonElement;
    stylesNames: CloseButtonStylesNames;
}>;
