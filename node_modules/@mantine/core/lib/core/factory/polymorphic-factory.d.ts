import { PolymorphicComponentProps } from './create-polymorphic-component';
import { ComponentClasses, FactoryPayload, StaticComponents, ThemeExtend } from './factory';
export interface PolymorphicFactoryPayload extends FactoryPayload {
    defaultComponent: any;
    defaultRef: any;
}
export type PolymorphicComponentWithProps<Payload extends PolymorphicFactoryPayload> = {
    withProps: <C = Payload['defaultComponent']>(fixedProps: PolymorphicComponentProps<C, Payload['props']>) => <L = C>(props: PolymorphicComponentProps<L, Payload['props']>) => React.ReactElement;
};
export declare function polymorphicFactory<Payload extends PolymorphicFactoryPayload>(ui: React.ForwardRefRenderFunction<Payload['defaultRef'], Payload['props']>): (<C = Payload["defaultComponent"]>(props: PolymorphicComponentProps<C, Payload["props"]>) => React.ReactElement) & Omit<import("react").FunctionComponent<(Payload["props"] & {
    component?: any;
} & Omit<Omit<any, "ref">, "component" | keyof Payload["props"]> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (Payload["props"] & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & ThemeExtend<Payload> & ComponentClasses<Payload> & PolymorphicComponentWithProps<Payload> & StaticComponents<Payload["staticComponents"]>;
export type MantinePolymorphicComponent<Payload extends PolymorphicFactoryPayload> = (<C = Payload['defaultComponent']>(props: PolymorphicComponentProps<C, Payload['props']>) => React.ReactElement) & Omit<React.FunctionComponent<PolymorphicComponentProps<any, Payload['props']>>, never> & ThemeExtend<Payload> & ComponentClasses<Payload> & PolymorphicComponentWithProps<Payload> & StaticComponents<Payload['staticComponents']>;
