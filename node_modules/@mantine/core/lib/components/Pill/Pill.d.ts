import { BoxProps, ElementProps, Factory, MantineRadius, MantineSize, StylesApiProps } from '../../core';
import { CloseButtonProps } from '../CloseButton';
import { PillGroup } from './PillGroup/PillGroup';
export type PillStylesNames = 'root' | 'label' | 'remove';
export type PillVariant = 'default' | 'contrast';
export type PillCssVariables = {
    root: '--pill-fz' | '--pill-radius' | '--pill-height';
};
export interface PillProps extends BoxProps, StylesApiProps<PillFactory>, ElementProps<'div'> {
    /** Controls pill `font-size` and `padding` @default `'sm'` */
    size?: MantineSize;
    /** Controls visibility of the remove button @default `false` */
    withRemoveButton?: boolean;
    /** Called when the remove button is clicked */
    onRemove?: () => void;
    /** Props passed down to the remove button */
    removeButtonProps?: CloseButtonProps & React.ComponentPropsWithoutRef<'button'>;
    /** Key of `theme.radius` or any valid CSS value to set border-radius. Numbers are converted to rem.  @default `'xl'` */
    radius?: MantineRadius;
    /** Adds disabled attribute, applies disabled styles */
    disabled?: boolean;
}
export type PillFactory = Factory<{
    props: PillProps;
    ref: HTMLDivElement;
    stylesNames: PillStylesNames;
    vars: PillCssVariables;
    variant: PillVariant;
    ctx: {
        size: MantineSize | (string & {}) | undefined;
    };
    staticComponents: {
        Group: typeof PillGroup;
    };
}>;
export declare const Pill: import("../..").MantineComponent<{
    props: PillProps;
    ref: HTMLDivElement;
    stylesNames: PillStylesNames;
    vars: PillCssVariables;
    variant: PillVariant;
    ctx: {
        size: MantineSize | (string & {}) | undefined;
    };
    staticComponents: {
        Group: typeof PillGroup;
    };
}>;
