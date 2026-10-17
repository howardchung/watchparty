import { ElementProps } from '../../../core';
import { InputClearButtonProps } from '../../Input';
export interface ComboboxClearButtonProps extends InputClearButtonProps, ElementProps<'button'> {
    onClear: () => void;
}
export declare const ComboboxClearButton: import("react").ForwardRefExoticComponent<ComboboxClearButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
