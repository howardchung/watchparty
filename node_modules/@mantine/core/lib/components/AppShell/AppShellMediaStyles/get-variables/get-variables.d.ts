import { MantineTheme } from '../../../../core';
import type { AppShellProps } from '../../AppShell';
export type CSSVariables = Record<`--${string}`, string | undefined>;
export type MediaQueryVariables = Record<string, Record<`--${string}`, string | undefined>>;
interface GetVariablesInput {
    navbar: AppShellProps['navbar'] | undefined;
    header: AppShellProps['header'] | undefined;
    footer: AppShellProps['footer'] | undefined;
    aside: AppShellProps['aside'] | undefined;
    padding: AppShellProps['padding'] | undefined;
    theme: MantineTheme;
}
export declare function getVariables({ navbar, header, footer, aside, padding, theme }: GetVariablesInput): {
    baseStyles: CSSVariables;
    media: {
        query: string;
        styles: Record<`--${string}`, string | undefined>;
    }[];
};
export {};
