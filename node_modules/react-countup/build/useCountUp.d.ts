import { CallbackProps, CommonProps, CountUpApi } from './types';
import React from 'react';
export interface UseCountUpProps extends CommonProps, CallbackProps {
    ref: string | React.RefObject<HTMLElement>;
    enableReinitialize?: boolean;
}
declare const useCountUp: (props: UseCountUpProps) => CountUpApi;
export default useCountUp;
