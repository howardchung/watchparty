import { MantineSize } from '../../../core';
export interface InputClearSectionProps {
    __clearable: boolean | undefined;
    __clearSection: React.ReactNode;
    rightSection: React.ReactNode;
    __defaultRightSection: React.ReactNode;
    size: MantineSize | string | undefined;
}
export declare function InputClearSection({ __clearable, __clearSection, rightSection, __defaultRightSection, size, }: InputClearSectionProps): string | number | bigint | boolean | Iterable<import("react").ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<import("react").ReactNode> | null | undefined> | import("react/jsx-runtime").JSX.Element | null | undefined;
