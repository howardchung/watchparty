import type { CmsdDynamicParams } from './CmsdDynamicParams.js';
/**
 * Common Media Server Data (CMSD) dynamic response header fields.
 *
 * @see {@link https://cdn.cta.tech/cta/media/media/resources/standards/pdfs/cta-5006-final.pdf|CMSD Spec}
 *
 * @group CMSD
 *
 * @beta
 */
export type CmsdDynamic = {
    /**
     * The server name.
     */
    value: string;
    /**
     * The CMSD dynamic parameters.
     */
    params: CmsdDynamicParams;
};
//# sourceMappingURL=CmsdDynamic.d.ts.map