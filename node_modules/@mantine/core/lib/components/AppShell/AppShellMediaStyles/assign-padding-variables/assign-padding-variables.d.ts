import type { AppShellProps } from '../../AppShell';
import type { CSSVariables, MediaQueryVariables } from '../get-variables/get-variables';
interface AssignPaddingVariablesInput {
    baseStyles: CSSVariables;
    minMediaStyles: MediaQueryVariables;
    padding: AppShellProps['padding'] | undefined;
}
export declare function assignPaddingVariables({ padding, baseStyles, minMediaStyles, }: AssignPaddingVariablesInput): void;
export {};
