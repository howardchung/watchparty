import { CSSProperties } from 'react';
import { CssVariable } from '../../../../Box';
import { MantineTheme } from '../../../../MantineProvider';
type ResolvedVars = Partial<Record<string, Record<CssVariable, string>>>;
export type VarsResolver = (theme: MantineTheme, props: Record<string, any>, stylesCtx: Record<string, any> | undefined) => ResolvedVars;
interface ResolveVarsInput {
    vars: VarsResolver | undefined;
    varsResolver: VarsResolver | undefined;
    theme: MantineTheme;
    props: Record<string, any>;
    stylesCtx: Record<string, any> | undefined;
    selector: string;
    themeName: string[];
    headless?: boolean;
}
export declare function resolveVars({ vars, varsResolver, theme, props, stylesCtx, selector, themeName, headless, }: ResolveVarsInput): CSSProperties;
export {};
