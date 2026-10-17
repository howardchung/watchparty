import React, { CSSProperties, ReactNode, ComponentPropsWithoutRef } from 'react';
import { CallbackProps, CommonProps, RenderCounterProps } from './types';
export interface CountUpProps extends CommonProps, CallbackProps {
    className?: string;
    redraw?: boolean;
    children?: (props: RenderCounterProps) => ReactNode;
    style?: CSSProperties;
    preserveValue?: boolean;
    containerProps?: ComponentPropsWithoutRef<'span'>;
}
declare const CountUp: React.FC<CountUpProps>;
export default CountUp;
