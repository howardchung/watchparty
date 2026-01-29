import { GetStylesApi } from '../../core';
import type { ModalRootFactory } from './ModalRoot';
export type ScrollAreaComponent = React.FC<any>;
interface ModalContext {
    fullScreen: boolean | undefined;
    yOffset: string | number | undefined;
    scrollAreaComponent: ScrollAreaComponent | undefined;
    getStyles: GetStylesApi<ModalRootFactory>;
}
export declare const ModalProvider: ({ children, value }: {
    value: ModalContext;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useModalContext: () => ModalContext;
export {};
