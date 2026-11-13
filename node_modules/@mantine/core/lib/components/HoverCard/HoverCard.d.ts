import { ExtendComponent, Factory } from '../../core';
import { PopoverProps, PopoverStylesNames } from '../Popover';
import { PopoverCssVariables } from '../Popover/Popover';
import { HoverCardDropdown } from './HoverCardDropdown/HoverCardDropdown';
import { HoverCardGroup } from './HoverCardGroup/HoverCardGroup';
export interface HoverCardProps extends Omit<PopoverProps, 'opened' | 'onChange'> {
    variant?: string;
    /** Initial opened state */
    initiallyOpened?: boolean;
    /** Called when the dropdown is opened */
    onOpen?: () => void;
    /** Called when the dropdown is closed */
    onClose?: () => void;
    /** Open delay in ms */
    openDelay?: number;
    /** Close delay in ms */
    closeDelay?: number;
}
export type HoverCardFactory = Factory<{
    props: HoverCardProps;
    stylesNames: PopoverStylesNames;
    vars: PopoverCssVariables;
}>;
export declare function HoverCard(props: HoverCardProps): import("react/jsx-runtime").JSX.Element;
export declare namespace HoverCard {
    var displayName: string;
    var Target: import("react").ForwardRefExoticComponent<import(".").HoverCardTargetProps & import("react").RefAttributes<HTMLElement>>;
    var Dropdown: typeof HoverCardDropdown;
    var Group: typeof HoverCardGroup;
    var extend: (input: ExtendComponent<HoverCardFactory>) => import("../../core/factory/factory").ExtendsRootComponent<{
        props: HoverCardProps;
        stylesNames: PopoverStylesNames;
        vars: PopoverCssVariables;
    }>;
}
