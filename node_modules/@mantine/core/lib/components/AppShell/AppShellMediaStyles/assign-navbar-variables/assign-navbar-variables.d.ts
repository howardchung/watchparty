import { MantineTheme } from '../../../../core';
import type { AppShellProps } from '../../AppShell';
import type { CSSVariables, MediaQueryVariables } from '../get-variables/get-variables';
interface AssignNavbarVariablesInput {
    baseStyles: CSSVariables;
    minMediaStyles: MediaQueryVariables;
    maxMediaStyles: MediaQueryVariables;
    navbar: AppShellProps['navbar'] | undefined;
    theme: MantineTheme;
}
export declare function assignNavbarVariables({ baseStyles, minMediaStyles, maxMediaStyles, navbar, theme, }: AssignNavbarVariablesInput): void;
export {};
