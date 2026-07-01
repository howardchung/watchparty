import type { MantineStyleProps } from '../style-props.types';
export declare function extractStyleProps<T extends Record<string, any>>(others: MantineStyleProps & T): {
    styleProps: MantineStyleProps & {
        sx?: any;
    };
    rest: T;
};
