import { GetStylesApiOptions } from '../../../styles-api.types';
import { ResolveClassNamesInput } from '../resolve-class-names/resolve-class-names';
interface GetOptionsClassNamesInput extends Omit<ResolveClassNamesInput, 'classNames'> {
    selector: string;
    options: GetStylesApiOptions | undefined;
}
export declare function getOptionsClassNames({ selector, stylesCtx, options, props, theme, }: GetOptionsClassNamesInput): string | undefined;
export {};
