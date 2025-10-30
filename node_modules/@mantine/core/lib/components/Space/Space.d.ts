import { BoxProps, ElementProps, Factory, StylesApiProps } from '../../core';
export interface SpaceProps extends BoxProps, StylesApiProps<SpaceFactory>, ElementProps<'div'> {
}
export type SpaceFactory = Factory<{
    props: SpaceProps;
    ref: HTMLDivElement;
}>;
export declare const Space: import("../..").MantineComponent<{
    props: SpaceProps;
    ref: HTMLDivElement;
}>;
