/// <reference types="react" />
export interface IGoogleRecaptchaProps {
    onVerify: (token: string) => void | Promise<void>;
    action?: string;
    refreshReCaptcha?: boolean | string | number | null;
}
export declare function GoogleReCaptcha({ action, onVerify, refreshReCaptcha, }: IGoogleRecaptchaProps): JSX.Element | null;
//# sourceMappingURL=google-recaptcha.d.ts.map