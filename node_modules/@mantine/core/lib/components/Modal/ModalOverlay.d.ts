import { CompoundStylesApiProps, Factory } from '../../core';
import { ModalBaseOverlayProps } from '../ModalBase';
export type ModalOverlayStylesNames = 'overlay';
export interface ModalOverlayProps extends ModalBaseOverlayProps, CompoundStylesApiProps<ModalOverlayFactory> {
}
export type ModalOverlayFactory = Factory<{
    props: ModalOverlayProps;
    ref: HTMLDivElement;
    stylesNames: ModalOverlayStylesNames;
    compound: true;
}>;
export declare const ModalOverlay: import("../..").MantineComponent<{
    props: ModalOverlayProps;
    ref: HTMLDivElement;
    stylesNames: ModalOverlayStylesNames;
    compound: true;
}>;
