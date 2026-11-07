import { Factory, MantineRadius, StylesApiProps } from '../../core';
import { ModalBaseProps, ModalBaseStylesNames } from '../ModalBase';
import { ScrollAreaComponent } from './Drawer.context';
type DrawerPosition = 'bottom' | 'left' | 'right' | 'top';
export type DrawerRootStylesNames = ModalBaseStylesNames;
export type DrawerRootCssVariables = {
    root: '--drawer-size' | '--drawer-flex' | '--drawer-height' | '--drawer-align' | '--drawer-justify' | '--drawer-offset';
};
export interface DrawerRootProps extends StylesApiProps<DrawerRootFactory>, ModalBaseProps {
    /** Scroll area component @default `'div'` */
    scrollAreaComponent?: ScrollAreaComponent;
    /** Side of the screen on which drawer will be opened @default `'left'` */
    position?: DrawerPosition;
    /** Key of `theme.radius` or any valid CSS value to set `border-radius`, numbers are converted to rem @default `0` */
    radius?: MantineRadius;
    /** Drawer container offset from the viewport end @default `0` */
    offset?: number | string;
}
export type DrawerRootFactory = Factory<{
    props: DrawerRootProps;
    ref: HTMLDivElement;
    stylesNames: DrawerRootStylesNames;
    vars: DrawerRootCssVariables;
    compound: true;
}>;
export declare const DrawerRoot: import("../..").MantineComponent<{
    props: DrawerRootProps;
    ref: HTMLDivElement;
    stylesNames: DrawerRootStylesNames;
    vars: DrawerRootCssVariables;
    compound: true;
}>;
export {};
