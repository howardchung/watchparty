interface UseComboboxTargetPropsInput {
    targetType: 'input' | 'button' | undefined;
    withAriaAttributes: boolean | undefined;
    withKeyboardNavigation: boolean | undefined;
    withExpandedAttribute: boolean | undefined;
    onKeyDown: React.KeyboardEventHandler<HTMLInputElement> | undefined;
    autoComplete: string | undefined;
}
export declare function useComboboxTargetProps({ onKeyDown, withKeyboardNavigation, withAriaAttributes, withExpandedAttribute, targetType, autoComplete, }: UseComboboxTargetPropsInput): {
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    'aria-haspopup': "listbox";
    'aria-expanded': boolean | undefined;
    'aria-controls': string | undefined;
    'aria-activedescendant': string | undefined;
    autoComplete: string | undefined;
    'data-expanded': true | undefined;
    'data-mantine-stop-propagation': true | undefined;
} | {
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    'aria-haspopup'?: undefined;
    'aria-expanded'?: undefined;
    'aria-controls'?: undefined;
    'aria-activedescendant'?: undefined;
    autoComplete?: undefined;
    'data-expanded'?: undefined;
    'data-mantine-stop-propagation'?: undefined;
};
export {};
