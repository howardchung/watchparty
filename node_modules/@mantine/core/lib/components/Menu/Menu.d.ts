import { ExtendComponent, Factory, StylesApiProps } from '../../core';
import { __PopoverProps, PopoverStylesNames } from '../Popover';
import { MenuSub } from './MenuSub/MenuSub';
export type MenuStylesNames = 'item' | 'itemLabel' | 'itemSection' | 'label' | 'divider' | 'chevron' | PopoverStylesNames;
export type MenuFactory = Factory<{
    props: MenuProps;
    stylesNames: MenuStylesNames;
}>;
export interface MenuProps extends __PopoverProps, StylesApiProps<MenuFactory> {
    variant?: string;
    /** Menu children */
    children?: React.ReactNode;
    /** Controlled menu opened state */
    opened?: boolean;
    /** Uncontrolled menu initial opened state */
    defaultOpened?: boolean;
    /** If set, focus is trapped within the menu dropdown when it is opened */
    trapFocus?: boolean;
    /** Called when menu opened state changes */
    onChange?: (opened: boolean) => void;
    /** Called when Menu is opened */
    onOpen?: () => void;
    /** Called when Menu is closed */
    onClose?: () => void;
    /** If set, the Menu is closed when one of the items is clicked */
    closeOnItemClick?: boolean;
    /** If set, arrow key presses loop though items (first to last and last to first) */
    loop?: boolean;
    /** If set, the dropdown is closed when the `Escape` key is pressed @default `true` */
    closeOnEscape?: boolean;
    /** Event trigger to open menu */
    trigger?: 'click' | 'hover' | 'click-hover';
    /** Open delay in ms, applicable only to `trigger="hover"` variant */
    openDelay?: number;
    /** Close delay in ms, applicable only to `trigger="hover"` variant */
    closeDelay?: number;
    /** If set, the dropdown is closed on outside clicks */
    closeOnClickOutside?: boolean;
    /** Events that trigger outside clicks @default `['mousedown', 'touchstart', 'keydown']` */
    clickOutsideEvents?: string[];
    /** Id base to create accessibility connections */
    id?: string;
    /** Set the `tabindex` on all menu items @default `-1` */
    menuItemTabIndex?: -1 | 0;
    /** If set, focus placeholder element is added before items @default `true` */
    withInitialFocusPlaceholder?: boolean;
}
export declare function Menu(_props: MenuProps): import("react/jsx-runtime").JSX.Element;
export declare namespace Menu {
    var extend: (input: ExtendComponent<MenuFactory>) => import("../../core/factory/factory").ExtendsRootComponent<{
        props: MenuProps;
        stylesNames: MenuStylesNames;
    }>;
    var withProps: (props: Partial<MenuProps>) => MenuProps;
    var classes: Record<string, string>;
    var displayName: string;
    var Item: (<C = "button">(props: import("../..").PolymorphicComponentProps<C, import(".").MenuItemProps>) => React.ReactElement) & Omit<import("react").FunctionComponent<(import(".").MenuItemProps & {
        component?: any;
    } & Omit<Omit<any, "ref">, "component" | keyof import(".").MenuItemProps> & {
        ref?: any;
        renderRoot?: (props: any) => any;
    }) | (import(".").MenuItemProps & {
        component: React.ElementType;
        renderRoot?: (props: Record<string, any>) => any;
    })>, never> & import("../../core/factory/factory").ThemeExtend<{
        props: import(".").MenuItemProps;
        defaultRef: HTMLButtonElement;
        defaultComponent: "button";
        stylesNames: import("./MenuItem/MenuItem").MenuItemStylesNames;
        compound: true;
    }> & import("../../core/factory/factory").ComponentClasses<{
        props: import(".").MenuItemProps;
        defaultRef: HTMLButtonElement;
        defaultComponent: "button";
        stylesNames: import("./MenuItem/MenuItem").MenuItemStylesNames;
        compound: true;
    }> & import("../../core/factory/polymorphic-factory").PolymorphicComponentWithProps<{
        props: import(".").MenuItemProps;
        defaultRef: HTMLButtonElement;
        defaultComponent: "button";
        stylesNames: import("./MenuItem/MenuItem").MenuItemStylesNames;
        compound: true;
    }> & Record<string, never>;
    var Label: import("../..").MantineComponent<{
        props: import(".").MenuLabelProps;
        ref: HTMLDivElement;
        stylesNames: import("./MenuLabel/MenuLabel").MenuLabelStylesNames;
        compound: true;
    }>;
    var Dropdown: import("../..").MantineComponent<{
        props: import(".").MenuDropdownProps;
        ref: HTMLDivElement;
        stylesNames: import("./MenuDropdown/MenuDropdown").MenuDropdownStylesNames;
        compound: true;
    }>;
    var Target: import("react").ForwardRefExoticComponent<import(".").MenuTargetProps & import("react").RefAttributes<HTMLElement>>;
    var Divider: import("../..").MantineComponent<{
        props: import(".").MenuDividerProps;
        ref: HTMLDivElement;
        stylesNames: import("./MenuDivider/MenuDivider").MenuDividerStylesNames;
        compound: true;
    }>;
    var Sub: typeof MenuSub;
}
