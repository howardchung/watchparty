import { CompoundStylesApiProps, Factory } from '../../core';
import { ModalBaseCloseButtonProps } from '../ModalBase';
export type ModalCloseButtonStylesNames = 'close';
export interface ModalCloseButtonProps extends ModalBaseCloseButtonProps, CompoundStylesApiProps<ModalCloseButtonFactory> {
}
export type ModalCloseButtonFactory = Factory<{
    props: ModalCloseButtonProps;
    ref: HTMLButtonElement;
    stylesNames: ModalCloseButtonStylesNames;
    compound: true;
}>;
export declare const ModalCloseButton: import("../..").MantineComponent<{
    props: ModalCloseButtonProps;
    ref: HTMLButtonElement;
    stylesNames: ModalCloseButtonStylesNames;
    compound: true;
}>;
