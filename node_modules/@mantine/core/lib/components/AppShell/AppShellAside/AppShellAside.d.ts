import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../../core';
import { AppShellCompoundProps } from '../AppShell.types';
export type AppShellAsideStylesNames = 'aside';
export interface AppShellAsideProps extends BoxProps, AppShellCompoundProps, StylesApiProps<AppShellAsideFactory>, ElementProps<'aside'> {
}
export type AppShellAsideFactory = Factory<{
    props: AppShellAsideProps;
    ref: HTMLElement;
    stylesNames: AppShellAsideStylesNames;
}>;
export declare const AppShellAside: import("../../..").MantineComponent<{
    props: AppShellAsideProps;
    ref: HTMLElement;
    stylesNames: AppShellAsideStylesNames;
}>;
