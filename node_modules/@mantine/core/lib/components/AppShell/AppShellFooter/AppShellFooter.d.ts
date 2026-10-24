import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../../core';
import { AppShellCompoundProps } from '../AppShell.types';
export type AppShellFooterStylesNames = 'footer';
export interface AppShellFooterProps extends BoxProps, AppShellCompoundProps, StylesApiProps<AppShellFooterFactory>, ElementProps<'footer'> {
}
export type AppShellFooterFactory = Factory<{
    props: AppShellFooterProps;
    ref: HTMLElement;
    stylesNames: AppShellFooterStylesNames;
}>;
export declare const AppShellFooter: import("../../..").MantineComponent<{
    props: AppShellFooterProps;
    ref: HTMLElement;
    stylesNames: AppShellFooterStylesNames;
}>;
