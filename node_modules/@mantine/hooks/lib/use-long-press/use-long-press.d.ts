import React from 'react';
export interface UseLongPressOptions {
    /** Time in milliseconds to trigger the long press, default is 400ms */
    threshold?: number;
    /** Callback triggered when the long press starts */
    onStart?: (event: React.MouseEvent | React.TouchEvent) => void;
    /** Callback triggered when the long press finishes */
    onFinish?: (event: React.MouseEvent | React.TouchEvent) => void;
    /** Callback triggered when the long press is canceled */
    onCancel?: (event: React.MouseEvent | React.TouchEvent) => void;
}
export interface UseLongPressReturnValue {
    onMouseDown: (event: React.MouseEvent) => void;
    onMouseUp: (event: React.MouseEvent) => void;
    onMouseLeave: (event: React.MouseEvent) => void;
    onTouchStart: (event: React.TouchEvent) => void;
    onTouchEnd: (event: React.TouchEvent) => void;
}
export declare function useLongPress(onLongPress: (event: React.MouseEvent | React.TouchEvent) => void, options?: UseLongPressOptions): UseLongPressReturnValue;
