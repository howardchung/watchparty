import { CompoundStylesApiProps, Factory } from '../../core';
import { ModalBaseContentProps } from '../ModalBase';
export type DrawerContentStylesNames = 'content' | 'inner';
export interface DrawerContentProps extends ModalBaseContentProps, CompoundStylesApiProps<DrawerContentFactory> {
    __hidden?: boolean;
}
export type DrawerContentFactory = Factory<{
    props: DrawerContentProps;
    ref: HTMLDivElement;
    stylesNames: DrawerContentStylesNames;
    compound: true;
}>;
export declare const DrawerContent: import("../..").MantineComponent<{
    props: DrawerContentProps;
    ref: HTMLDivElement;
    stylesNames: DrawerContentStylesNames;
    compound: true;
}>;
