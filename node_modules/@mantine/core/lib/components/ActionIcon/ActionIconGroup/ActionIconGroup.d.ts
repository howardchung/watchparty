import { BoxProps, Factory, StylesApiProps } from '../../../core';
export type ActionIconGroupStylesNames = 'group';
export type ActionIconGroupCssVariables = {
    group: '--ai-border-width';
};
export interface ActionIconGroupProps extends BoxProps, StylesApiProps<ActionIconGroupFactory> {
    /** `ActionIcon` and `ActionIcon.GroupSection` components only */
    children?: React.ReactNode;
    /** Group orientation @default `'horizontal'` */
    orientation?: 'horizontal' | 'vertical';
    /** `border-width` of the child components. @default `1` */
    borderWidth?: number | string;
}
export type ActionIconGroupFactory = Factory<{
    props: ActionIconGroupProps;
    ref: HTMLDivElement;
    stylesNames: ActionIconGroupStylesNames;
    vars: ActionIconGroupCssVariables;
}>;
export declare const ActionIconGroup: import("../../..").MantineComponent<{
    props: ActionIconGroupProps;
    ref: HTMLDivElement;
    stylesNames: ActionIconGroupStylesNames;
    vars: ActionIconGroupCssVariables;
}>;
