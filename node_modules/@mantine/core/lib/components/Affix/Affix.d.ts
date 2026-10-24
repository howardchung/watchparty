import { BoxProps, ElementProps, Factory, MantineSize, StylesApiProps } from '../../core';
import { BasePortalProps } from '../Portal';
export type AffixStylesNames = 'root';
export type AffixCssVariables = {
    root: '--affix-z-index' | '--affix-top' | '--affix-left' | '--affix-bottom' | '--affix-right';
};
export interface AffixPosition {
    top?: MantineSize | (string & {}) | number;
    left?: MantineSize | (string & {}) | number;
    bottom?: MantineSize | (string & {}) | number;
    right?: MantineSize | (string & {}) | number;
}
export interface AffixBaseProps {
    /** Root element `z-index` property @default `200`  */
    zIndex?: React.CSSProperties['zIndex'];
    /** Determines whether the component is rendered within `Portal` @default `true` */
    withinPortal?: boolean;
    /** Props passed down to the `Portal` component. Ignored when `withinPortal` is `false`. */
    portalProps?: BasePortalProps;
    /** Affix position on screen @default `{ bottom: 0, right: 0 }` */
    position?: AffixPosition;
}
export interface AffixProps extends BoxProps, AffixBaseProps, StylesApiProps<AffixFactory>, ElementProps<'div'> {
}
export type AffixFactory = Factory<{
    props: AffixProps;
    ref: HTMLDivElement;
    stylesNames: AffixStylesNames;
    vars: AffixCssVariables;
}>;
export declare const Affix: import("../..").MantineComponent<{
    props: AffixProps;
    ref: HTMLDivElement;
    stylesNames: AffixStylesNames;
    vars: AffixCssVariables;
}>;
