import { MantineColor, MantineTheme } from '../theme.types';
interface GetColorVariablesInput {
    theme: MantineTheme;
    color: MantineColor;
    colorScheme: 'light' | 'dark';
    name?: string;
    withColorValues?: boolean;
}
export declare function getCSSColorVariables({ theme, color, colorScheme, name, withColorValues, }: GetColorVariablesInput): {
    [x: string]: string;
};
export {};
