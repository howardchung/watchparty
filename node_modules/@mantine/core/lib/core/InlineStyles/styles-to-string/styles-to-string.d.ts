export interface InlineStylesMediaQuery {
    query: string;
    styles: React.CSSProperties;
}
export interface InlineStylesInput {
    selector: string;
    styles?: React.CSSProperties;
    media?: InlineStylesMediaQuery[];
    container?: InlineStylesMediaQuery[];
}
export declare function stylesToString({ selector, styles, media, container }: InlineStylesInput): string;
