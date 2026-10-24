import { CompoundStylesApiProps, Factory } from '../../core';
import { ModalBaseHeaderProps } from '../ModalBase';
export type DrawerHeaderStylesNames = 'header';
export interface DrawerHeaderProps extends ModalBaseHeaderProps, CompoundStylesApiProps<DrawerHeaderFactory> {
}
export type DrawerHeaderFactory = Factory<{
    props: DrawerHeaderProps;
    ref: HTMLElement;
    stylesNames: DrawerHeaderStylesNames;
    compound: true;
}>;
export declare const DrawerHeader: import("../..").MantineComponent<{
    props: DrawerHeaderProps;
    ref: HTMLElement;
    stylesNames: DrawerHeaderStylesNames;
    compound: true;
}>;
