type ExtendedProps<Props = {}, OverrideProps = {}> = OverrideProps & Omit<Props, keyof OverrideProps>;
type ElementType = keyof React.JSX.IntrinsicElements | React.JSXElementConstructor<any>;
type PropsOf<C extends ElementType> = React.JSX.LibraryManagedAttributes<C, React.ComponentPropsWithoutRef<C>>;
type ComponentProp<C> = {
    component?: C;
};
type InheritedProps<C extends ElementType, Props = {}> = ExtendedProps<PropsOf<C>, Props>;
export type PolymorphicRef<C> = C extends React.ElementType ? React.ComponentPropsWithRef<C>['ref'] : never;
export type PolymorphicComponentProps<C, Props = {}> = C extends React.ElementType ? InheritedProps<C, Props & ComponentProp<C>> & {
    ref?: PolymorphicRef<C>;
    renderRoot?: (props: any) => any;
} : Props & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
};
export declare function createPolymorphicComponent<ComponentDefaultType, Props, StaticComponents = Record<string, never>>(component: any): (<C = ComponentDefaultType>(props: PolymorphicComponentProps<C, Props>) => React.ReactElement) & Omit<import("react").FunctionComponent<(Props & ComponentProp<any> & Omit<Omit<any, "ref">, "component" | keyof Props> & {
    ref?: any;
    renderRoot?: (props: any) => any;
}) | (Props & {
    component: React.ElementType;
    renderRoot?: (props: Record<string, any>) => any;
})>, never> & StaticComponents;
export {};
