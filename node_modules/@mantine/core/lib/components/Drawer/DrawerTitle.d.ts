import { CompoundStylesApiProps, Factory } from '../../core';
import { ModalBaseTitleProps } from '../ModalBase';
export type DrawerTitleStylesNames = 'title';
export interface DrawerTitleProps extends ModalBaseTitleProps, CompoundStylesApiProps<DrawerTitleFactory> {
}
export type DrawerTitleFactory = Factory<{
    props: DrawerTitleProps;
    ref: HTMLHeadingElement;
    stylesNames: DrawerTitleStylesNames;
    compound: true;
}>;
export declare const DrawerTitle: import("../..").MantineComponent<{
    props: DrawerTitleProps;
    ref: HTMLHeadingElement;
    stylesNames: DrawerTitleStylesNames;
    compound: true;
}>;
