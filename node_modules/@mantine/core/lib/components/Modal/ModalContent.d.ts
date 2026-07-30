import { CompoundStylesApiProps, Factory } from '../../core';
import { ModalBaseContentProps } from '../ModalBase';
export type ModalContentStylesNames = 'content' | 'inner';
export interface ModalContentProps extends ModalBaseContentProps, CompoundStylesApiProps<ModalContentFactory> {
    __hidden?: boolean;
}
export type ModalContentFactory = Factory<{
    props: ModalContentProps;
    ref: HTMLDivElement;
    stylesNames: ModalContentStylesNames;
    compound: true;
}>;
export declare const ModalContent: import("../..").MantineComponent<{
    props: ModalContentProps;
    ref: HTMLDivElement;
    stylesNames: ModalContentStylesNames;
    compound: true;
}>;
