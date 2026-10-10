import { CSSProperties } from 'react';
import type { MantineStyleProp } from '../../Box';
import { FactoryPayload } from '../../factory';
import { PartialVarsResolver, VarsResolver } from '../create-vars-resolver/create-vars-resolver';
import { Attributes, ClassNames, ClassNamesArray, GetStylesApiOptions, Styles } from '../styles-api.types';
export interface UseStylesInput<Payload extends FactoryPayload> {
    name: string | (string | undefined)[];
    classes: Payload['stylesNames'] extends string ? Record<string, string> : never;
    props: Payload['props'];
    stylesCtx?: Payload['ctx'];
    className?: string;
    style?: MantineStyleProp;
    rootSelector?: Payload['stylesNames'];
    unstyled?: boolean;
    classNames?: ClassNames<Payload> | ClassNamesArray<Payload>;
    styles?: Styles<Payload>;
    vars?: PartialVarsResolver<Payload>;
    varsResolver?: VarsResolver<Payload>;
    attributes?: Attributes<Payload>;
}
export type GetStylesApi<Payload extends FactoryPayload> = (selector: NonNullable<Payload['stylesNames']>, options?: GetStylesApiOptions) => {
    className: string;
    style: CSSProperties;
};
export declare function useStyles<Payload extends FactoryPayload>({ name, classes, props, stylesCtx, className, style, rootSelector, unstyled, classNames, styles, vars, varsResolver, attributes, }: UseStylesInput<Payload>): GetStylesApi<Payload>;
