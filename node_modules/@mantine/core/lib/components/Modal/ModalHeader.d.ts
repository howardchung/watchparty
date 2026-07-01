import { CompoundStylesApiProps, Factory } from '../../core';
import { ModalBaseHeaderProps } from '../ModalBase';
export type ModalHeaderStylesNames = 'header';
export interface ModalHeaderProps extends ModalBaseHeaderProps, CompoundStylesApiProps<ModalHeaderFactory> {
}
export type ModalHeaderFactory = Factory<{
    props: ModalHeaderProps;
    ref: HTMLElement;
    stylesNames: ModalHeaderStylesNames;
    compound: true;
}>;
export declare const ModalHeader: import("../..").MantineComponent<{
    props: ModalHeaderProps;
    ref: HTMLElement;
    stylesNames: ModalHeaderStylesNames;
    compound: true;
}>;
