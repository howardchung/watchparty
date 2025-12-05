import { FactoryPayload } from '../../factory';
import { ClassNames, Styles } from '../styles-api.types';
export interface UseResolvedStylesApiInput<Payload extends FactoryPayload> {
    classNames: ClassNames<Payload> | undefined;
    styles: Styles<Payload> | undefined;
    props: Record<string, any>;
    stylesCtx?: Record<string, any>;
}
export declare function useResolvedStylesApi<Payload extends FactoryPayload>({ classNames, styles, props, stylesCtx, }: UseResolvedStylesApiInput<Payload>): {
    resolvedClassNames: Partial<Record<string, string>>;
    resolvedStyles: Record<string, any>;
};
