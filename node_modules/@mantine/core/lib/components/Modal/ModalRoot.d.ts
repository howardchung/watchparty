import { Factory, MantineRadius, StylesApiProps } from '../../core';
import { ModalBaseProps, ModalBaseStylesNames } from '../ModalBase';
import { ScrollAreaComponent } from './Modal.context';
export type ModalRootStylesNames = ModalBaseStylesNames;
export type ModalRootCssVariables = {
    root: '--modal-radius' | '--modal-size' | '--modal-y-offset' | '--modal-x-offset';
};
export interface ModalRootProps extends StylesApiProps<ModalRootFactory>, ModalBaseProps {
    __staticSelector?: string;
    /** Top/bottom modal offset @default `5dvh` */
    yOffset?: React.CSSProperties['marginTop'];
    /** Left/right modal offset @default `5vw` */
    xOffset?: React.CSSProperties['marginLeft'];
    /** Scroll area component @default `'div'` */
    scrollAreaComponent?: ScrollAreaComponent;
    /** Key of `theme.radius` or any valid CSS value to set `border-radius` @default `theme.defaultRadius` */
    radius?: MantineRadius;
    /** If set, the modal is centered vertically @default `false` */
    centered?: boolean;
    /** If set, the modal takes the entire screen @default `false` */
    fullScreen?: boolean;
}
export type ModalRootFactory = Factory<{
    props: ModalRootProps;
    ref: HTMLDivElement;
    stylesNames: ModalRootStylesNames;
    vars: ModalRootCssVariables;
    compound: true;
}>;
export declare const ModalRoot: import("../..").MantineComponent<{
    props: ModalRootProps;
    ref: HTMLDivElement;
    stylesNames: ModalRootStylesNames;
    vars: ModalRootCssVariables;
    compound: true;
}>;
