import { CompoundStylesApiProps, Factory } from '../../core';
import { ModalBaseTitleProps } from '../ModalBase';
export type ModalTitleStylesNames = 'title';
export interface ModalTitleProps extends ModalBaseTitleProps, CompoundStylesApiProps<ModalTitleFactory> {
}
export type ModalTitleFactory = Factory<{
    props: ModalTitleProps;
    ref: HTMLHeadingElement;
    stylesNames: ModalTitleStylesNames;
    compound: true;
}>;
export declare const ModalTitle: import("../..").MantineComponent<{
    props: ModalTitleProps;
    ref: HTMLHeadingElement;
    stylesNames: ModalTitleStylesNames;
    compound: true;
}>;
