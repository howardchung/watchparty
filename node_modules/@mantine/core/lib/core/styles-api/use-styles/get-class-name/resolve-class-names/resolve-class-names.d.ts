import { MantineTheme } from '../../../../MantineProvider';
import type { _ClassNames } from '../get-class-name';
export interface ResolveClassNamesInput {
    theme: MantineTheme;
    classNames: _ClassNames;
    props: Record<string, any>;
    stylesCtx: Record<string, any> | undefined;
}
export declare function resolveClassNames({ theme, classNames, props, stylesCtx }: ResolveClassNamesInput): Partial<Record<string, string>>;
