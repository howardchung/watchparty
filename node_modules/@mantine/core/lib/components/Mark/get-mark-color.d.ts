import { MantineColor, MantineTheme } from '../../core';
interface GetMarkColorInput {
    color: MantineColor | string | undefined;
    theme: MantineTheme;
    defaultShade: number;
}
export declare function getMarkColor({ color, theme, defaultShade }: GetMarkColorInput): string | undefined;
export {};
