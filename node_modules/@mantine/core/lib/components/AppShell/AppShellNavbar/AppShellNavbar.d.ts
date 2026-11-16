import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../../core';
import type { AppShellCompoundProps } from '../AppShell.types';
export type AppShellNavbarStylesNames = 'navbar';
export interface AppShellNavbarProps extends BoxProps, AppShellCompoundProps, StylesApiProps<AppShellNavbarFactory>, ElementProps<'div'> {
}
export type AppShellNavbarFactory = Factory<{
    props: AppShellNavbarProps;
    ref: HTMLElement;
    stylesNames: AppShellNavbarStylesNames;
}>;
export declare const AppShellNavbar: import("../../..").MantineComponent<{
    props: AppShellNavbarProps;
    ref: HTMLElement;
    stylesNames: AppShellNavbarStylesNames;
}>;
