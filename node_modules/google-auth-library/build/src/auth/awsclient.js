"use strict";
// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsClient = void 0;
const awsrequestsigner_1 = require("./awsrequestsigner");
const baseexternalclient_1 = require("./baseexternalclient");
/**
 * AWS external account client. This is used for AWS workloads, where
 * AWS STS GetCallerIdentity serialized signed requests are exchanged for
 * GCP access token.
 */
class AwsClient extends baseexternalclient_1.BaseExternalAccountClient {
    /**
     * Instantiates an AwsClient instance using the provided JSON
     * object loaded from an external account credentials file.
     * An error is thrown if the credential is not a valid AWS credential.
     * @param options The external account options object typically loaded
     *   from the external account JSON credential file.
     * @param additionalOptions Optional additional behavior customization
     *   options. These currently customize expiration threshold time and
     *   whether to retry on 401/403 API request errors.
     */
    constructor(options, additionalOptions) {
        super(options, additionalOptions);
        this.environmentId = options.credential_source.environment_id;
        // This is only required if the AWS region is not available in the
        // AWS_REGION or AWS_DEFAULT_REGION environment variables.
        this.regionUrl = options.credential_source.region_url;
        // This is only required if AWS security credentials are not available in
        // environment variables.
        this.securityCredentialsUrl = options.credential_source.url;
        this.regionalCredVerificationUrl =
            options.credential_source.regional_cred_verification_url;
        this.imdsV2SessionTokenUrl =
            options.credential_source.imdsv2_session_token_url;
        this.awsRequestSigner = null;
        this.region = '';
        // Data validators.
        this.validateEnvironmentId();
    }
    validateEnvironmentId() {
        var _a;
        const match = (_a = this.environmentId) === null || _a === void 0 ? void 0 : _a.match(/^(aws)(\d+)$/);
        if (!match || !this.regionalCredVerificationUrl) {
            throw new Error('No valid AWS "credential_source" provided');
        }
        else if (parseInt(match[2], 10) !== 1) {
            throw new Error(`aws version "${match[2]}" is not supported in the current build.`);
        }
    }
    /**
     * Triggered when an external subject token is needed to be exchanged for a
     * GCP access token via GCP STS endpoint.
     * This uses the `options.credential_source` object to figure out how
     * to retrieve the token using the current environment. In this case,
     * this uses a serialized AWS signed request to the STS GetCallerIdentity
     * endpoint.
     * The logic is summarized as:
     * 1. If imdsv2_session_token_url is provided in the credential source, then
     *    fetch the aws session token and include it in the headers of the
     *    metadata requests. This is a requirement for IDMSv2 but optional
     *    for IDMSv1.
     * 2. Retrieve AWS region from availability-zone.
     * 3a. Check AWS credentials in environment variables. If not found, get
     *     from security-credentials endpoint.
     * 3b. Get AWS credentials from security-credentials endpoint. In order
     *     to retrieve this, the AWS role needs to be determined by calling
     *     security-credentials endpoint without any argument. Then the
     *     credentials can be retrieved via: security-credentials/role_name
     * 4. Generate the signed request to AWS STS GetCallerIdentity action.
     * 5. Inject x-goog-cloud-target-resource into header and serialize the
     *    signed request. This will be the subject-token to pass to GCP STS.
     * @return A promise that resolves with the external subject token.
     */
    async retrieveSubjectToken() {
        // Initialize AWS request signer if not already initialized.
        if (!this.awsRequestSigner) {
            const metadataHeaders = {};
            // Only retrieve the IMDSv2 session token if both the security credentials and region are
            // not retrievable through the environment.
            // The credential config contains all the URLs by default but clients may be running this
            // where the metadata server is not available and returning the credentials through the environment.
            // Removing this check may break them.
            if (this.shouldUseMetadataServer() && this.imdsV2SessionTokenUrl) {
                metadataHeaders['x-aws-ec2-metadata-token'] =
                    await this.getImdsV2SessionToken();
            }
            this.region = await this.getAwsRegion(metadataHeaders);
            this.awsRequestSigner = new awsrequestsigner_1.AwsRequestSigner(async () => {
                // Check environment variables for permanent credentials first.
                // https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html
                if (this.securityCredentialsFromEnv) {
                    return this.securityCredentialsFromEnv;
                }
                // Since the role on a VM can change, we don't need to cache it.
                const roleName = await this.getAwsRoleName(metadataHeaders);
                // Temporary credentials typically last for several hours.
                // Expiration is returned in response.
                // Consider future optimization of this logic to cache AWS tokens
                // until their natural expiration.
                const awsCreds = await this.getAwsSecurityCredentials(roleName, metadataHeaders);
                return {
                    accessKeyId: awsCreds.AccessKeyId,
                    secretAccessKey: awsCreds.SecretAccessKey,
                    token: awsCreds.Token,
                };
            }, this.region);
        }
        // Generate signed request to AWS STS GetCallerIdentity API.
        // Use the required regional endpoint. Otherwise, the request will fail.
        const options = await this.awsRequestSigner.getRequestOptions({
            url: this.regionalCredVerificationUrl.replace('{region}', this.region),
            method: 'POST',
        });
        // The GCP STS endpoint expects the headers to be formatted as:
        // [
        //   {key: 'x-amz-date', value: '...'},
        //   {key: 'Authorization', value: '...'},
        //   ...
        // ]
        // And then serialized as:
        // encodeURIComponent(JSON.stringify({
        //   url: '...',
        //   method: 'POST',
        //   headers: [{key: 'x-amz-date', value: '...'}, ...]
        // }))
        const reformattedHeader = [];
        const extendedHeaders = Object.assign({
            // The full, canonical resource name of the workload identity pool
            // provider, with or without the HTTPS prefix.
            // Including this header as part of the signature is recommended to
            // ensure data integrity.
            'x-goog-cloud-target-resource': this.audience,
        }, options.headers);
        // Reformat header to GCP STS expected format.
        for (const key in extendedHeaders) {
            reformattedHeader.push({
                key,
                value: extendedHeaders[key],
            });
        }
        // Serialize the reformatted signed request.
        return encodeURIComponent(JSON.stringify({
            url: options.url,
            method: options.method,
            headers: reformattedHeader,
        }));
    }
    /**
     * @return A promise that resolves with the IMDSv2 Session Token.
     */
    async getImdsV2SessionToken() {
        const opts = {
            url: this.imdsV2SessionTokenUrl,
            method: 'PUT',
            responseType: 'text',
            headers: { 'x-aws-ec2-metadata-token-ttl-seconds': '300' },
        };
        const response = await this.transporter.request(opts);
        return response.data;
    }
    /**
     * @param headers The headers to be used in the metadata request.
     * @return A promise that resolves with the current AWS region.
     */
    async getAwsRegion(headers) {
        // Priority order for region determination:
        // AWS_REGION > AWS_DEFAULT_REGION > metadata server.
        if (this.regionFromEnv) {
            return this.regionFromEnv;
        }
        if (!this.regionUrl) {
            throw new Error('Unable to determine AWS region due to missing ' +
                '"options.credential_source.region_url"');
        }
        const opts = {
            url: this.regionUrl,
            method: 'GET',
            responseType: 'text',
            headers: headers,
        };
        const response = await this.transporter.request(opts);
        // Remove last character. For example, if us-east-2b is returned,
        // the region would be us-east-2.
        return response.data.substr(0, response.data.length - 1);
    }
    /**
     * @param headers The headers to be used in the metadata request.
     * @return A promise that resolves with the assigned role to the current
     *   AWS VM. This is needed for calling the security-credentials endpoint.
     */
    async getAwsRoleName(headers) {
        if (!this.securityCredentialsUrl) {
            throw new Error('Unable to determine AWS role name due to missing ' +
                '"options.credential_source.url"');
        }
        const opts = {
            url: this.securityCredentialsUrl,
            method: 'GET',
            responseType: 'text',
            headers: headers,
        };
        const response = await this.transporter.request(opts);
        return response.data;
    }
    /**
     * Retrieves the temporary AWS credentials by calling the security-credentials
     * endpoint as specified in the `credential_source` object.
     * @param roleName The role attached to the current VM.
     * @param headers The headers to be used in the metadata request.
     * @return A promise that resolves with the temporary AWS credentials
     *   needed for creating the GetCallerIdentity signed request.
     */
    async getAwsSecurityCredentials(roleName, headers) {
        const response = await this.transporter.request({
            url: `${this.securityCredentialsUrl}/${roleName}`,
            responseType: 'json',
            headers: headers,
        });
        return response.data;
    }
    shouldUseMetadataServer() {
        // The metadata server must be used when either the AWS region or AWS security
        // credentials cannot be retrieved through their defined environment variables.
        return !this.regionFromEnv || !this.securityCredentialsFromEnv;
    }
    get regionFromEnv() {
        // The AWS region can be provided through AWS_REGION or AWS_DEFAULT_REGION.
        // Only one is required.
        return (process.env['AWS_REGION'] || process.env['AWS_DEFAULT_REGION'] || null);
    }
    get securityCredentialsFromEnv() {
        // Both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required.
        if (process.env['AWS_ACCESS_KEY_ID'] &&
            process.env['AWS_SECRET_ACCESS_KEY']) {
            return {
                accessKeyId: process.env['AWS_ACCESS_KEY_ID'],
                secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'],
                token: process.env['AWS_SESSION_TOKEN'],
            };
        }
        return null;
    }
}
exports.AwsClient = AwsClient;
AwsClient.AWS_EC2_METADATA_IPV4_ADDRESS = '169.254.169.254';
AwsClient.AWS_EC2_METADATA_IPV6_ADDRESS = 'fd00:ec2::254';
//# sourceMappingURL=awsclient.js.map