import { InlineStylesInput } from './styles-to-string/styles-to-string';
export interface InlineStylesProps extends InlineStylesInput, Omit<React.ComponentPropsWithoutRef<'style'>, keyof InlineStylesInput> {
}
export declare function InlineStyles(props: InlineStylesInput): import("react/jsx-runtime").JSX.Element;
