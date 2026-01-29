import { CompoundStylesApiProps, Factory } from '../../core';
import { ModalBaseBodyProps } from '../ModalBase';
export type ModalBodyStylesNames = 'body';
export interface ModalBodyProps extends ModalBaseBodyProps, CompoundStylesApiProps<ModalBodyFactory> {
}
export type ModalBodyFactory = Factory<{
    props: ModalBodyProps;
    ref: HTMLDivElement;
    stylesNames: ModalBodyStylesNames;
    compound: true;
}>;
export declare const ModalBody: import("../..").MantineComponent<{
    props: ModalBodyProps;
    ref: HTMLDivElement;
    stylesNames: ModalBodyStylesNames;
    compound: true;
}>;
