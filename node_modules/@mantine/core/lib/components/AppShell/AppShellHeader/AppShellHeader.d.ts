import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../../core';
import type { AppShellCompoundProps } from '../AppShell.types';
export type AppShellHeaderStylesNames = 'header';
export interface AppShellHeaderProps extends BoxProps, AppShellCompoundProps, StylesApiProps<AppShellHeaderFactory>, ElementProps<'header'> {
}
export type AppShellHeaderFactory = Factory<{
    props: AppShellHeaderProps;
    ref: HTMLElement;
    stylesNames: AppShellHeaderStylesNames;
}>;
export declare const AppShellHeader: import("../../..").MantineComponent<{
    props: AppShellHeaderProps;
    ref: HTMLElement;
    stylesNames: AppShellHeaderStylesNames;
}>;
