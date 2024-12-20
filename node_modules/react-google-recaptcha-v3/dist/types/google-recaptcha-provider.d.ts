import React, { ReactNode } from 'react';
interface IGoogleReCaptchaProviderProps {
    reCaptchaKey: string;
    language?: string;
    useRecaptchaNet?: boolean;
    useEnterprise?: boolean;
    scriptProps?: {
        nonce?: string;
        defer?: boolean;
        async?: boolean;
        appendTo?: 'head' | 'body';
        id?: string;
        onLoadCallbackName?: string;
    };
    container?: {
        element?: string | HTMLElement;
        parameters: {
            badge?: 'inline' | 'bottomleft' | 'bottomright';
            theme?: 'dark' | 'light';
            tabindex?: number;
            callback?: () => void;
            expiredCallback?: () => void;
            errorCallback?: () => void;
        };
    };
    children: ReactNode;
}
export interface IGoogleReCaptchaConsumerProps {
    executeRecaptcha?: (action?: string) => Promise<string>;
    container?: string | HTMLElement;
}
declare const GoogleReCaptchaContext: React.Context<IGoogleReCaptchaConsumerProps>;
declare const GoogleReCaptchaConsumer: React.Consumer<IGoogleReCaptchaConsumerProps>;
export declare function GoogleReCaptchaProvider({ reCaptchaKey, useEnterprise, useRecaptchaNet, scriptProps, language, container, children }: IGoogleReCaptchaProviderProps): JSX.Element;
export { GoogleReCaptchaConsumer, GoogleReCaptchaContext };
//# sourceMappingURL=google-recaptcha-provider.d.ts.map