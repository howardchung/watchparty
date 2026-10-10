import type { AppShellProps } from '../../AppShell';
import type { CSSVariables, MediaQueryVariables } from '../get-variables/get-variables';
interface AssignFooterVariablesInput {
    baseStyles: CSSVariables;
    minMediaStyles: MediaQueryVariables;
    footer: AppShellProps['footer'] | undefined;
}
export declare function assignFooterVariables({ baseStyles, minMediaStyles, footer, }: AssignFooterVariablesInput): void;
export {};
