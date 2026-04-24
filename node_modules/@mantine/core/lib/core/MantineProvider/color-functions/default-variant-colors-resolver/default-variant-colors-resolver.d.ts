import { MantineColor, MantineGradient, MantineTheme } from '../../theme.types';
export interface VariantColorsResolverInput {
    color: MantineColor | undefined;
    theme: MantineTheme;
    variant: string;
    gradient?: MantineGradient;
    autoContrast?: boolean;
}
export interface VariantColorResolverResult {
    background: string;
    hover: string;
    color: string;
    border: string;
    hoverColor?: string;
}
export type VariantColorsResolver = (input: VariantColorsResolverInput) => VariantColorResolverResult;
export declare const defaultVariantColorsResolver: VariantColorsResolver;
