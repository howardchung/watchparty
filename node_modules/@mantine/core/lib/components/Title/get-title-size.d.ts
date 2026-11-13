import type { TitleOrder, TitleSize } from './Title';
export interface GetTitleSizeResult {
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
}
export declare function getTitleSize(order: TitleOrder, size?: TitleSize): GetTitleSizeResult;
