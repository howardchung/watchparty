import { BoxProps, ElementProps, Factory, MantineColor, StylesApiProps } from '../../core';
export type CodeStylesNames = 'root';
export type CodeCssVariables = {
    root: '--code-bg';
};
export interface CodeProps extends BoxProps, StylesApiProps<CodeFactory>, ElementProps<'code'> {
    /** Key of `theme.colors` or any valid CSS color, controls `background-color` of the code. By default, calculated based on the color scheme. */
    color?: MantineColor;
    /** If set, code is rendered in `pre` */
    block?: boolean;
}
export type CodeFactory = Factory<{
    props: CodeProps;
    ref: HTMLElement;
    stylesNames: CodeStylesNames;
    vars: CodeCssVariables;
}>;
export declare const Code: import("../..").MantineComponent<{
    props: CodeProps;
    ref: HTMLElement;
    stylesNames: CodeStylesNames;
    vars: CodeCssVariables;
}>;
