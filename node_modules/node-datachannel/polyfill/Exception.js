export const InvalidStateError = (msg) => {
    return new DOMException(msg, 'InvalidStateError');
};

export const InvalidAccessError = (msg) => {
    return new DOMException(msg, 'InvalidAccessError');
};

export const NotFoundError = (msg) => {
    return new DOMException(msg, 'NotFoundError');
};

export const OperationError = (msg) => {
    return new DOMException(msg, 'OperationError');
};

export const TypeError = (msg) => {
    return new DOMException(msg, 'TypeError');
};

export const SyntaxError = (msg) => {
    return new DOMException(msg, 'SyntaxError');
};
