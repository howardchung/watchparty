/*! firebase-admin v11.11.1 */
/*!
 * @license
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { App } from '../app';
import { BatchResponse, Message, MessagingTopicManagementResponse, MulticastMessage, MessagingDevicesResponse, MessagingDeviceGroupResponse, MessagingPayload, MessagingOptions, MessagingTopicResponse, MessagingConditionResponse } from './messaging-api';
/**
 * Messaging service bound to the provided app.
 */
export declare class Messaging {
    private urlPath;
    private readonly appInternal;
    private readonly messagingRequestHandler;
    /**
     * The {@link firebase-admin.app#App} associated with the current `Messaging` service
     * instance.
     *
     * @example
     * ```javascript
     * var app = messaging.app;
     * ```
     */
    get app(): App;
    /**
     * Sends the given message via FCM.
     *
     * @param message - The message payload.
     * @param dryRun - Whether to send the message in the dry-run
     *   (validation only) mode.
     * @returns A promise fulfilled with a unique message ID
     *   string after the message has been successfully handed off to the FCM
     *   service for delivery.
     */
    send(message: Message, dryRun?: boolean): Promise<string>;
    /**
    * Sends each message in the given array via Firebase Cloud Messaging.
    *
    * Unlike {@link Messaging.sendAll}, this method makes a single RPC call for each message
    * in the given array.
    *
    * The responses list obtained from the return value corresponds to the order of `messages`.
    * An error from this method or a `BatchResponse` with all failures indicates a total failure,
    * meaning that none of the messages in the list could be sent. Partial failures or no
    * failures are only indicated by a `BatchResponse` return value.
    *
    * @param messages - A non-empty array
    *   containing up to 500 messages.
    * @param dryRun - Whether to send the messages in the dry-run
    *   (validation only) mode.
    * @returns A Promise fulfilled with an object representing the result of the
    *   send operation.
    */
    sendEach(messages: Message[], dryRun?: boolean): Promise<BatchResponse>;
    /**
     * Sends the given multicast message to all the FCM registration tokens
     * specified in it.
     *
     * This method uses the {@link Messaging.sendEach} API under the hood to send the given
     * message to all the target recipients. The responses list obtained from the
     * return value corresponds to the order of tokens in the `MulticastMessage`.
     * An error from this method or a `BatchResponse` with all failures indicates a total
     * failure, meaning that the messages in the list could be sent. Partial failures or
     * failures are only indicated by a `BatchResponse` return value.
     *
     * @param message - A multicast message
     *   containing up to 500 tokens.
     * @param dryRun - Whether to send the message in the dry-run
     *   (validation only) mode.
     * @returns A Promise fulfilled with an object representing the result of the
     *   send operation.
     */
    sendEachForMulticast(message: MulticastMessage, dryRun?: boolean): Promise<BatchResponse>;
    /**
     * Sends all the messages in the given array via Firebase Cloud Messaging.
     * Employs batching to send the entire list as a single RPC call. Compared
     * to the `send()` method, this method is a significantly more efficient way
     * to send multiple messages.
     *
     * The responses list obtained from the return value
     * corresponds to the order of tokens in the `MulticastMessage`. An error
     * from this method indicates a total failure, meaning that none of the messages
     * in the list could be sent. Partial failures are indicated by a `BatchResponse`
     * return value.
     *
     * @param messages - A non-empty array
     *   containing up to 500 messages.
     * @param dryRun - Whether to send the messages in the dry-run
     *   (validation only) mode.
     * @returns A Promise fulfilled with an object representing the result of the
     *   send operation.
     *
     * @deprecated Use {@link Messaging.sendEach} instead.
     */
    sendAll(messages: Message[], dryRun?: boolean): Promise<BatchResponse>;
    /**
     * Sends the given multicast message to all the FCM registration tokens
     * specified in it.
     *
     * This method uses the `sendAll()` API under the hood to send the given
     * message to all the target recipients. The responses list obtained from the
     * return value corresponds to the order of tokens in the `MulticastMessage`.
     * An error from this method indicates a total failure, meaning that the message
     * was not sent to any of the tokens in the list. Partial failures are indicated
     * by a `BatchResponse` return value.
     *
     * @param message - A multicast message
     *   containing up to 500 tokens.
     * @param dryRun - Whether to send the message in the dry-run
     *   (validation only) mode.
     * @returns A Promise fulfilled with an object representing the result of the
     *   send operation.
     *
     * @deprecated Use {@link Messaging.sendEachForMulticast} instead.
     */
    sendMulticast(message: MulticastMessage, dryRun?: boolean): Promise<BatchResponse>;
    /**
     * Sends an FCM message to a single device corresponding to the provided
     * registration token.
     *
     * See {@link https://firebase.google.com/docs/cloud-messaging/admin/legacy-fcm#send_to_individual_devices |
     * Send to individual devices}
     * for code samples and detailed documentation. Takes either a
     * `registrationToken` to send to a single device or a
     * `registrationTokens` parameter containing an array of tokens to send
     * to multiple devices.
     *
     * @param registrationToken - A device registration token or an array of
     *   device registration tokens to which the message should be sent.
     * @param payload - The message payload.
     * @param options - Optional options to
     *   alter the message.
     *
     * @returns A promise fulfilled with the server's response after the message
     *   has been sent.
     *
     * @deprecated Use {@link Messaging.send} instead.
     */
    sendToDevice(registrationTokenOrTokens: string | string[], payload: MessagingPayload, options?: MessagingOptions): Promise<MessagingDevicesResponse>;
    /**
     * Sends an FCM message to a device group corresponding to the provided
     * notification key.
     *
     * See {@link https://firebase.google.com/docs/cloud-messaging/admin/legacy-fcm#send_to_a_device_group |
     * Send to a device group} for code samples and detailed documentation.
     *
     * @param notificationKey - The notification key for the device group to
     *   which to send the message.
     * @param payload - The message payload.
     * @param options - Optional options to
     *   alter the message.
     *
     * @returns A promise fulfilled with the server's response after the message
     *   has been sent.
     *
     * @deprecated Use {@link Messaging.send} instead.
     */
    sendToDeviceGroup(notificationKey: string, payload: MessagingPayload, options?: MessagingOptions): Promise<MessagingDeviceGroupResponse>;
    /**
     * Sends an FCM message to a topic.
     *
     * See {@link https://firebase.google.com/docs/cloud-messaging/admin/legacy-fcm#send_to_a_topic |
     * Send to a topic} for code samples and detailed documentation.
     *
     * @param topic - The topic to which to send the message.
     * @param payload - The message payload.
     * @param options - Optional options to
     *   alter the message.
     *
     * @returns A promise fulfilled with the server's response after the message
     *   has been sent.
     */
    sendToTopic(topic: string, payload: MessagingPayload, options?: MessagingOptions): Promise<MessagingTopicResponse>;
    /**
     * Sends an FCM message to a condition.
     *
     * See {@link https://firebase.google.com/docs/cloud-messaging/admin/legacy-fcm#send_to_a_condition |
     * Send to a condition}
     * for code samples and detailed documentation.
     *
     * @param condition - The condition determining to which topics to send
     *   the message.
     * @param payload - The message payload.
     * @param options - Optional options to
     *   alter the message.
     *
     * @returns A promise fulfilled with the server's response after the message
     *   has been sent.
     */
    sendToCondition(condition: string, payload: MessagingPayload, options?: MessagingOptions): Promise<MessagingConditionResponse>;
    /**
     * Subscribes a device to an FCM topic.
     *
     * See {@link https://firebase.google.com/docs/cloud-messaging/manage-topics#suscribe_and_unsubscribe_using_the |
     * Subscribe to a topic}
     * for code samples and detailed documentation. Optionally, you can provide an
     * array of tokens to subscribe multiple devices.
     *
     * @param registrationTokens - A token or array of registration tokens
     *   for the devices to subscribe to the topic.
     * @param topic - The topic to which to subscribe.
     *
     * @returns A promise fulfilled with the server's response after the device has been
     *   subscribed to the topic.
     */
    subscribeToTopic(registrationTokenOrTokens: string | string[], topic: string): Promise<MessagingTopicManagementResponse>;
    /**
     * Unsubscribes a device from an FCM topic.
     *
     * See {@link https://firebase.google.com/docs/cloud-messaging/admin/manage-topic-subscriptions#unsubscribe_from_a_topic |
     * Unsubscribe from a topic}
     * for code samples and detailed documentation.  Optionally, you can provide an
     * array of tokens to unsubscribe multiple devices.
     *
     * @param registrationTokens - A device registration token or an array of
     *   device registration tokens to unsubscribe from the topic.
     * @param topic - The topic from which to unsubscribe.
     *
     * @returns A promise fulfilled with the server's response after the device has been
     *   unsubscribed from the topic.
     */
    unsubscribeFromTopic(registrationTokenOrTokens: string | string[], topic: string): Promise<MessagingTopicManagementResponse>;
    private getUrlPath;
    /**
     * Helper method which sends and handles topic subscription management requests.
     *
     * @param registrationTokenOrTokens - The registration token or an array of
     *     registration tokens to unsubscribe from the topic.
     * @param topic - The topic to which to subscribe.
     * @param methodName - The name of the original method called.
     * @param path - The endpoint path to use for the request.
     *
     * @returns A Promise fulfilled with the parsed server
     *   response.
     */
    private sendTopicManagementRequest;
    /**
     * Validates the types of the messaging payload and options. If invalid, an error will be thrown.
     *
     * @param payload - The messaging payload to validate.
     * @param options - The messaging options to validate.
     */
    private validateMessagingPayloadAndOptionsTypes;
    /**
     * Validates the messaging payload. If invalid, an error will be thrown.
     *
     * @param payload - The messaging payload to validate.
     *
     * @returns A copy of the provided payload with whitelisted properties switched
     *     from camelCase to underscore_case.
     */
    private validateMessagingPayload;
    /**
     * Validates the messaging options. If invalid, an error will be thrown.
     *
     * @param options - The messaging options to validate.
     *
     * @returns A copy of the provided options with whitelisted properties switched
     *   from camelCase to underscore_case.
     */
    private validateMessagingOptions;
    /**
     * Validates the type of the provided registration token(s). If invalid, an error will be thrown.
     *
     * @param registrationTokenOrTokens - The registration token(s) to validate.
     * @param method - The method name to use in error messages.
     * @param errorInfo - The error info to use if the registration tokens are invalid.
     */
    private validateRegistrationTokensType;
    /**
     * Validates the provided registration tokens. If invalid, an error will be thrown.
     *
     * @param registrationTokenOrTokens - The registration token or an array of
     *     registration tokens to validate.
     * @param method - The method name to use in error messages.
     * @param errorInfo - The error info to use if the registration tokens are invalid.
     */
    private validateRegistrationTokens;
    /**
     * Validates the type of the provided topic. If invalid, an error will be thrown.
     *
     * @param topic - The topic to validate.
     * @param method - The method name to use in error messages.
     * @param errorInfo - The error info to use if the topic is invalid.
     */
    private validateTopicType;
    /**
     * Validates the provided topic. If invalid, an error will be thrown.
     *
     * @param topic - The topic to validate.
     * @param method - The method name to use in error messages.
     * @param errorInfo - The error info to use if the topic is invalid.
     */
    private validateTopic;
    /**
     * Normalizes the provided topic name by prepending it with '/topics/', if necessary.
     *
     * @param topic - The topic name to normalize.
     *
     * @returns The normalized topic name.
     */
    private normalizeTopic;
}
