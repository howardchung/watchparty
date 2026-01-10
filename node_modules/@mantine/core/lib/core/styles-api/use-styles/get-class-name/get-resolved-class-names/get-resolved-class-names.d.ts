import { ResolveClassNamesInput } from '../resolve-class-names/resolve-class-names';
interface GetResolvedClassNamesOptions extends ResolveClassNamesInput {
    selector: string;
}
export declare function getResolvedClassNames({ selector, stylesCtx, theme, classNames, props, }: GetResolvedClassNamesOptions): string | undefined;
export {};
