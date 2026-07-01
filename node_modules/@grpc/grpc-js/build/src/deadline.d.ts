export declare type Deadline = Date | number;
export declare function minDeadline(...deadlineList: Deadline[]): Deadline;
export declare function getDeadlineTimeoutString(deadline: Deadline): string;
export declare function getRelativeTimeout(deadline: Deadline): number;
