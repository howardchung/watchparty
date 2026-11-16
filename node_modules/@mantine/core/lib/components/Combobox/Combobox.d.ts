import { ExtendComponent, Factory, MantineSize, MantineThemeComponent, StylesApiProps } from '../../core';
import { __PopoverProps } from '../Popover';
import { ComboboxChevron } from './ComboboxChevron/ComboboxChevron';
import { ComboboxClearButton } from './ComboboxClearButton/ComboboxClearButton';
import { ComboboxDropdown } from './ComboboxDropdown/ComboboxDropdown';
import { ComboboxDropdownTarget } from './ComboboxDropdownTarget/ComboboxDropdownTarget';
import { ComboboxEmpty } from './ComboboxEmpty/ComboboxEmpty';
import { ComboboxEventsTarget } from './ComboboxEventsTarget/ComboboxEventsTarget';
import { ComboboxFooter } from './ComboboxFooter/ComboboxFooter';
import { ComboboxGroup } from './ComboboxGroup/ComboboxGroup';
import { ComboboxHeader } from './ComboboxHeader/ComboboxHeader';
import { ComboboxHiddenInput } from './ComboboxHiddenInput/ComboboxHiddenInput';
import { ComboboxOption, ComboboxOptionProps } from './ComboboxOption/ComboboxOption';
import { ComboboxOptions } from './ComboboxOptions/ComboboxOptions';
import { ComboboxSearch } from './ComboboxSearch/ComboboxSearch';
import { ComboboxTarget } from './ComboboxTarget/ComboboxTarget';
import { ComboboxStore } from './use-combobox/use-combobox';
export type ComboboxStylesNames = 'options' | 'dropdown' | 'option' | 'search' | 'empty' | 'footer' | 'header' | 'group' | 'groupLabel';
export type ComboboxCSSVariables = {
    options: '--combobox-option-fz' | '--combobox-option-padding';
    dropdown: '--combobox-padding' | '--combobox-option-fz' | '--combobox-option-padding';
};
export interface ComboboxProps extends __PopoverProps, StylesApiProps<ComboboxFactory> {
    __staticSelector?: string;
    /** Combobox content */
    children?: React.ReactNode;
    /** Combobox store, can be used to control combobox state */
    store?: ComboboxStore;
    /** Called when item is selected with the `Enter` key or by clicking it */
    onOptionSubmit?: (value: string, optionProps: ComboboxOptionProps) => void;
    /** Controls items `font-size` and `padding` @default `'sm'` */
    size?: MantineSize | (string & {});
    /** Controls `padding` of the dropdown @default `4` */
    dropdownPadding?: React.CSSProperties['padding'];
    /** Determines whether selection should be reset when option is hovered @default `false` */
    resetSelectionOnOptionHover?: boolean;
    /** Determines whether the `Combobox` value can be changed */
    readOnly?: boolean;
}
export type ComboboxFactory = Factory<{
    props: ComboboxProps;
    ref: HTMLDivElement;
    stylesNames: ComboboxStylesNames;
    vars: ComboboxCSSVariables;
    staticComponents: {
        Target: typeof ComboboxTarget;
        Dropdown: typeof ComboboxDropdown;
        Options: typeof ComboboxOptions;
        Option: typeof ComboboxOption;
        Search: typeof ComboboxSearch;
        Empty: typeof ComboboxEmpty;
        Chevron: typeof ComboboxChevron;
        Footer: typeof ComboboxFooter;
        Header: typeof ComboboxHeader;
        EventsTarget: typeof ComboboxEventsTarget;
        DropdownTarget: typeof ComboboxDropdownTarget;
        Group: typeof ComboboxGroup;
        ClearButton: typeof ComboboxClearButton;
        HiddenInput: typeof ComboboxHiddenInput;
    };
}>;
export declare function Combobox(_props: ComboboxProps): import("react/jsx-runtime").JSX.Element;
export declare namespace Combobox {
    var extend: (c: ExtendComponent<ComboboxFactory>) => MantineThemeComponent;
    var classes: any;
    var displayName: string;
    var Target: import("../..").MantineComponent<{
        props: import(".").ComboboxTargetProps;
        ref: HTMLElement;
        compound: true;
    }>;
    var Dropdown: import("../..").MantineComponent<{
        props: import(".").ComboboxDropdownProps;
        ref: HTMLDivElement;
        stylesNames: import("./ComboboxDropdown/ComboboxDropdown").ComboboxDropdownStylesNames;
        compound: true;
    }>;
    var Options: import("../..").MantineComponent<{
        props: import(".").ComboboxOptionsProps;
        ref: HTMLDivElement;
        stylesNames: import("./ComboboxOptions/ComboboxOptions").ComboboxOptionsStylesNames;
        compound: true;
    }>;
    var Option: import("../..").MantineComponent<{
        props: ComboboxOptionProps;
        ref: HTMLDivElement;
        stylesNames: import("./ComboboxOption/ComboboxOption").ComboboxOptionStylesNames;
        compound: true;
    }>;
    var Search: import("../..").MantineComponent<{
        props: import(".").ComboboxSearchProps;
        ref: HTMLInputElement;
        stylesNames: import("./ComboboxSearch/ComboboxSearch").ComboboxSearchStylesNames;
    }>;
    var Empty: import("../..").MantineComponent<{
        props: import(".").ComboboxEmptyProps;
        ref: HTMLDivElement;
        stylesNames: import("./ComboboxEmpty/ComboboxEmpty").ComboboxEmptyStylesNames;
        compound: true;
    }>;
    var Chevron: import("../..").MantineComponent<{
        props: import(".").ComboboxChevronProps;
        ref: SVGSVGElement;
        stylesNames: import("./ComboboxChevron/ComboboxChevron").ComboboxChevronStylesNames;
        vars: import("./ComboboxChevron/ComboboxChevron").ComboboxChevronCSSVariables;
    }>;
    var Footer: import("../..").MantineComponent<{
        props: import(".").ComboboxFooterProps;
        ref: HTMLDivElement;
        stylesNames: import("./ComboboxFooter/ComboboxFooter").ComboboxFooterStylesNames;
        compound: true;
    }>;
    var Header: import("../..").MantineComponent<{
        props: import(".").ComboboxHeaderProps;
        ref: HTMLDivElement;
        stylesNames: import("./ComboboxHeader/ComboboxHeader").ComboboxHeaderStylesNames;
        compound: true;
    }>;
    var EventsTarget: import("../..").MantineComponent<{
        props: import(".").ComboboxEventsTargetProps;
        ref: HTMLElement;
        compound: true;
    }>;
    var DropdownTarget: import("../..").MantineComponent<{
        props: import(".").ComboboxDropdownTargetProps;
        ref: HTMLElement;
        compound: true;
    }>;
    var Group: import("../..").MantineComponent<{
        props: import(".").ComboboxGroupProps;
        ref: HTMLDivElement;
        stylesNames: import("./ComboboxGroup/ComboboxGroup").ComboboxGroupStylesNames;
        compound: true;
    }>;
    var ClearButton: import("react").ForwardRefExoticComponent<import(".").ComboboxClearButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
    var HiddenInput: typeof ComboboxHiddenInput;
}
