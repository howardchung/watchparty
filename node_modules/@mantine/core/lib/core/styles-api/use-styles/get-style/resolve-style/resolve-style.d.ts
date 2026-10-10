import { CSSProperties } from 'react';
import { MantineStyleProp } from '../../../../Box';
import { MantineTheme } from '../../../../MantineProvider';
interface ResolveStyleInput {
    style: MantineStyleProp | undefined;
    theme: MantineTheme;
}
export declare function resolveStyle({ style, theme }: ResolveStyleInput): CSSProperties;
export {};
