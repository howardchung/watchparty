interface IInjectGoogleReCaptchaScriptParams {
    render: string;
    onLoadCallbackName: string;
    useRecaptchaNet: boolean;
    useEnterprise: boolean;
    onLoad: () => void;
    onError: () => void;
    language?: string;
    scriptProps?: {
        nonce?: string;
        defer?: boolean;
        async?: boolean;
        appendTo?: 'head' | 'body';
        id?: string;
    };
}
/**
 * Function to check if script has already been injected
 *
 * @param scriptId
 * @returns
 */
export declare const isScriptInjected: (scriptId: string) => boolean;
/**
 * Function to clean node of badge element
 *
 * @param container
 * @returns
 */
export declare const cleanBadge: (container?: string | HTMLElement | undefined) => void;
/**
 * Function to clean google recaptcha script
 *
 * @param scriptId
 * @param container
 */
export declare const cleanGoogleRecaptcha: (scriptId: string, container?: string | HTMLElement | undefined) => void;
/**
 * Function to inject the google recaptcha script
 *
 * @param param0
 * @returns
 */
export declare const injectGoogleReCaptchaScript: ({ render, onLoadCallbackName, language, onLoad, useRecaptchaNet, useEnterprise, scriptProps: { nonce, defer, async, id, appendTo } }: IInjectGoogleReCaptchaScriptParams) => void;
/**
 * Function to log warning message if it's not in production mode
 *
 * @param message String
 * @returns
 */
export declare const logWarningMessage: (message: string) => void;
export {};
//# sourceMappingURL=utils.d.ts.map