import { GetStylesApi, MantineRadius } from '../../core';
import type { DrawerRootFactory } from './DrawerRoot';
export type ScrollAreaComponent = React.FC<any>;
interface DrawerContext {
    scrollAreaComponent: ScrollAreaComponent | undefined;
    getStyles: GetStylesApi<DrawerRootFactory>;
    radius: MantineRadius | undefined;
}
export declare const DrawerProvider: ({ children, value }: {
    value: DrawerContext;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element, useDrawerContext: () => DrawerContext;
export {};
