import React from 'react';
import { ComponentType } from 'react';
import { IGoogleReCaptchaConsumerProps } from './google-recaptcha-provider';
export interface IWithGoogleReCaptchaProps {
    googleReCaptchaProps: IGoogleReCaptchaConsumerProps;
}
export declare const withGoogleReCaptcha: <OwnProps>(Component: React.ComponentType<OwnProps & Partial<IWithGoogleReCaptchaProps>>) => React.ComponentType<OwnProps & Partial<IWithGoogleReCaptchaProps>>;
//# sourceMappingURL=with-google-recaptcha.d.ts.map