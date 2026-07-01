import { ExtendComponent, Factory } from '../../../core';
import { FloatingAxesOffsets, FloatingPosition } from '../../../utils/Floating';
import { __PopoverProps } from '../../Popover';
import { TransitionOverride } from '../../Transition';
import { MenuSubTarget } from '../MenuSubTarget/MenuSubTarget';
export type MenuSubFactory = Factory<{
    props: MenuSubProps;
}>;
export interface MenuSubProps extends __PopoverProps {
    children: React.ReactNode;
    /** Called with current state when dropdown opens or closes */
    onChange?: (opened: boolean) => void;
    /** Open delay in ms */
    openDelay?: number;
    /** Close delay in ms */
    closeDelay?: number;
    /** Dropdown position relative to the target element @default `'right-start'` */
    position?: FloatingPosition;
    /** Offset of the dropdown element @default `0` */
    offset?: number | FloatingAxesOffsets;
    /** Props passed down to the `Transition` component that used to animate dropdown presence, use to configure duration and animation type @default `{ duration: 0 }` */
    transitionProps?: TransitionOverride;
}
export declare function MenuSub(_props: MenuSubProps): import("react/jsx-runtime").JSX.Element;
export declare namespace MenuSub {
    var extend: (input: ExtendComponent<MenuSubFactory>) => import("../../../core/factory/factory").ExtendsRootComponent<{
        props: MenuSubProps;
    }>;
    var displayName: string;
    var Target: typeof MenuSubTarget;
    var Dropdown: import("../../..").MantineComponent<{
        props: import("..").MenuSubDropdownProps;
        ref: HTMLDivElement;
        stylesNames: import("../MenuSubDropdown/MenuSubDropdown").MenuSubDropdownStylesNames;
        compound: true;
    }>;
    var Item: (<C = "button">(props: import("../../..").PolymorphicComponentProps<C, import("..").MenuSubItemProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(import("..").MenuSubItemProps & {
        component?: any;
    } & Omit<Omit<any, "ref">, "component" | keyof import("..").MenuSubItemProps> & {
        ref?: any;
        renderRoot?: (props: any) => any;
    }) | (import("..").MenuSubItemProps & {
        component: React.ElementType;
        renderRoot?: (props: Record<string, any>) => any;
    })>, never> & import("../../../core/factory/factory").ThemeExtend<{
        props: import("..").MenuSubItemProps;
        defaultRef: HTMLButtonElement;
        defaultComponent: "button";
        stylesNames: import("../MenuSubItem/MenuSubItem").MenuSubItemStylesNames;
        compound: true;
    }> & import("../../../core/factory/factory").ComponentClasses<{
        props: import("..").MenuSubItemProps;
        defaultRef: HTMLButtonElement;
        defaultComponent: "button";
        stylesNames: import("../MenuSubItem/MenuSubItem").MenuSubItemStylesNames;
        compound: true;
    }> & import("../../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
        props: import("..").MenuSubItemProps;
        defaultRef: HTMLButtonElement;
        defaultComponent: "button";
        stylesNames: import("../MenuSubItem/MenuSubItem").MenuSubItemStylesNames;
        compound: true;
    }> & Record<string, never>;
}
