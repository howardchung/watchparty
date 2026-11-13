import { CompoundStylesApiProps, Factory } from '../../core';
import { ModalBaseOverlayProps } from '../ModalBase';
export type DrawerOverlayStylesNames = 'overlay';
export interface DrawerOverlayProps extends ModalBaseOverlayProps, CompoundStylesApiProps<DrawerOverlayFactory> {
}
export type DrawerOverlayFactory = Factory<{
    props: DrawerOverlayProps;
    ref: HTMLDivElement;
    stylesNames: DrawerOverlayStylesNames;
    compound: true;
}>;
export declare const DrawerOverlay: import("../..").MantineComponent<{
    props: DrawerOverlayProps;
    ref: HTMLDivElement;
    stylesNames: DrawerOverlayStylesNames;
    compound: true;
}>;
