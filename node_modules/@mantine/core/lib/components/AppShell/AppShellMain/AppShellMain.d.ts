import { BoxProps, CompoundStylesApiProps, ElementProps, Factory } from '../../../core';
export type AppShellMainStylesNames = 'main';
export interface AppShellMainProps extends BoxProps, CompoundStylesApiProps<AppShellMainFactory>, ElementProps<'main'> {
}
export type AppShellMainFactory = Factory<{
    props: AppShellMainProps;
    ref: HTMLElement;
    stylesNames: AppShellMainStylesNames;
    compound: true;
}>;
export declare const AppShellMain: import("../../..").MantineComponent<{
    props: AppShellMainProps;
    ref: HTMLElement;
    stylesNames: AppShellMainStylesNames;
    compound: true;
}>;
