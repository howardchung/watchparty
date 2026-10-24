import { BoxProps, Factory, MantineColor, MantineSize, StylesApiProps } from '../../core';
import type { MantineLoader, MantineLoadersRecord } from './Loader.types';
export type LoaderStylesNames = 'root';
export type LoaderCssVariables = {
    root: '--loader-size' | '--loader-color';
};
export interface LoaderProps extends BoxProps, StylesApiProps<LoaderFactory>, Omit<React.ComponentPropsWithoutRef<'svg'>, keyof BoxProps> {
    /** Controls `width` and `height` of the loader. `Loader` has predefined `xs`-`xl` values. Numbers are converted to rem. @default `'md'` */
    size?: MantineSize | (string & {}) | number;
    /** Key of `theme.colors` or any valid CSS color @default `theme.primaryColor` */
    color?: MantineColor;
    /** Loader type, key of `loaders` prop @default `'oval'` */
    type?: MantineLoader;
    /** Object of loaders components, can be customized via default props or inline. */
    loaders?: MantineLoadersRecord;
    /** Overrides default loader with given content */
    children?: React.ReactNode;
}
export type LoaderFactory = Factory<{
    props: LoaderProps;
    ref: HTMLSpanElement;
    stylesNames: LoaderStylesNames;
    vars: LoaderCssVariables;
    staticComponents: {
        defaultLoaders: typeof defaultLoaders;
    };
}>;
export declare const defaultLoaders: MantineLoadersRecord;
export declare const Loader: import("../..").MantineComponent<{
    props: LoaderProps;
    ref: HTMLSpanElement;
    stylesNames: LoaderStylesNames;
    vars: LoaderCssVariables;
    staticComponents: {
        defaultLoaders: typeof defaultLoaders;
    };
}>;
