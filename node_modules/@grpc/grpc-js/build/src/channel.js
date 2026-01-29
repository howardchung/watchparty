"use strict";
/*
 * Copyright 2019 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelImplementation = void 0;
const call_stream_1 = require("./call-stream");
const channel_credentials_1 = require("./channel-credentials");
const resolving_load_balancer_1 = require("./resolving-load-balancer");
const subchannel_pool_1 = require("./subchannel-pool");
const picker_1 = require("./picker");
const constants_1 = require("./constants");
const filter_stack_1 = require("./filter-stack");
const call_credentials_filter_1 = require("./call-credentials-filter");
const deadline_filter_1 = require("./deadline-filter");
const compression_filter_1 = require("./compression-filter");
const resolver_1 = require("./resolver");
const logging_1 = require("./logging");
const max_message_size_filter_1 = require("./max-message-size-filter");
const http_proxy_1 = require("./http_proxy");
const uri_parser_1 = require("./uri-parser");
const connectivity_state_1 = require("./connectivity-state");
const channelz_1 = require("./channelz");
/**
 * See https://nodejs.org/api/timers.html#timers_setinterval_callback_delay_args
 */
const MAX_TIMEOUT_TIME = 2147483647;
let nextCallNumber = 0;
function getNewCallNumber() {
    const callNumber = nextCallNumber;
    nextCallNumber += 1;
    if (nextCallNumber >= Number.MAX_SAFE_INTEGER) {
        nextCallNumber = 0;
    }
    return callNumber;
}
const INAPPROPRIATE_CONTROL_PLANE_CODES = [
    constants_1.Status.OK,
    constants_1.Status.INVALID_ARGUMENT,
    constants_1.Status.NOT_FOUND,
    constants_1.Status.ALREADY_EXISTS,
    constants_1.Status.FAILED_PRECONDITION,
    constants_1.Status.ABORTED,
    constants_1.Status.OUT_OF_RANGE,
    constants_1.Status.DATA_LOSS
];
function restrictControlPlaneStatusCode(code, details) {
    if (INAPPROPRIATE_CONTROL_PLANE_CODES.includes(code)) {
        return {
            code: constants_1.Status.INTERNAL,
            details: `Invalid status from control plane: ${code} ${constants_1.Status[code]} ${details}`
        };
    }
    else {
        return { code, details };
    }
}
class ChannelImplementation {
    constructor(target, credentials, options) {
        var _a, _b, _c, _d;
        this.credentials = credentials;
        this.options = options;
        this.connectivityState = connectivity_state_1.ConnectivityState.IDLE;
        this.currentPicker = new picker_1.UnavailablePicker();
        /**
         * Calls queued up to get a call config. Should only be populated before the
         * first time the resolver returns a result, which includes the ConfigSelector.
         */
        this.configSelectionQueue = [];
        this.pickQueue = [];
        this.connectivityStateWatchers = [];
        this.configSelector = null;
        /**
         * This is the error from the name resolver if it failed most recently. It
         * is only used to end calls that start while there is no config selector
         * and the name resolver is in backoff, so it should be nulled if
         * configSelector becomes set or the channel state becomes anything other
         * than TRANSIENT_FAILURE.
         */
        this.currentResolutionError = null;
        // Channelz info
        this.channelzEnabled = true;
        this.callTracker = new channelz_1.ChannelzCallTracker();
        this.childrenTracker = new channelz_1.ChannelzChildrenTracker();
        if (typeof target !== 'string') {
            throw new TypeError('Channel target must be a string');
        }
        if (!(credentials instanceof channel_credentials_1.ChannelCredentials)) {
            throw new TypeError('Channel credentials must be a ChannelCredentials object');
        }
        if (options) {
            if (typeof options !== 'object') {
                throw new TypeError('Channel options must be an object');
            }
        }
        this.originalTarget = target;
        const originalTargetUri = uri_parser_1.parseUri(target);
        if (originalTargetUri === null) {
            throw new Error(`Could not parse target name "${target}"`);
        }
        /* This ensures that the target has a scheme that is registered with the
         * resolver */
        const defaultSchemeMapResult = resolver_1.mapUriDefaultScheme(originalTargetUri);
        if (defaultSchemeMapResult === null) {
            throw new Error(`Could not find a default scheme for target name "${target}"`);
        }
        this.callRefTimer = setInterval(() => { }, MAX_TIMEOUT_TIME);
        (_b = (_a = this.callRefTimer).unref) === null || _b === void 0 ? void 0 : _b.call(_a);
        if (this.options['grpc.enable_channelz'] === 0) {
            this.channelzEnabled = false;
        }
        this.channelzTrace = new channelz_1.ChannelzTrace();
        this.channelzRef = channelz_1.registerChannelzChannel(target, () => this.getChannelzInfo(), this.channelzEnabled);
        if (this.channelzEnabled) {
            this.channelzTrace.addTrace('CT_INFO', 'Channel created');
        }
        if (this.options['grpc.default_authority']) {
            this.defaultAuthority = this.options['grpc.default_authority'];
        }
        else {
            this.defaultAuthority = resolver_1.getDefaultAuthority(defaultSchemeMapResult);
        }
        const proxyMapResult = http_proxy_1.mapProxyName(defaultSchemeMapResult, options);
        this.target = proxyMapResult.target;
        this.options = Object.assign({}, this.options, proxyMapResult.extraOptions);
        /* The global boolean parameter to getSubchannelPool has the inverse meaning to what
         * the grpc.use_local_subchannel_pool channel option means. */
        this.subchannelPool = subchannel_pool_1.getSubchannelPool(((_c = options['grpc.use_local_subchannel_pool']) !== null && _c !== void 0 ? _c : 0) === 0);
        const channelControlHelper = {
            createSubchannel: (subchannelAddress, subchannelArgs) => {
                const subchannel = this.subchannelPool.getOrCreateSubchannel(this.target, subchannelAddress, Object.assign({}, this.options, subchannelArgs), this.credentials);
                if (this.channelzEnabled) {
                    this.channelzTrace.addTrace('CT_INFO', 'Created subchannel or used existing subchannel', subchannel.getChannelzRef());
                }
                return subchannel;
            },
            updateState: (connectivityState, picker) => {
                this.currentPicker = picker;
                const queueCopy = this.pickQueue.slice();
                this.pickQueue = [];
                this.callRefTimerUnref();
                for (const { callStream, callMetadata, callConfig, dynamicFilters } of queueCopy) {
                    this.tryPick(callStream, callMetadata, callConfig, dynamicFilters);
                }
                this.updateState(connectivityState);
            },
            requestReresolution: () => {
                // This should never be called.
                throw new Error('Resolving load balancer should never call requestReresolution');
            },
            addChannelzChild: (child) => {
                if (this.channelzEnabled) {
                    this.childrenTracker.refChild(child);
                }
            },
            removeChannelzChild: (child) => {
                if (this.channelzEnabled) {
                    this.childrenTracker.unrefChild(child);
                }
            }
        };
        this.resolvingLoadBalancer = new resolving_load_balancer_1.ResolvingLoadBalancer(this.target, channelControlHelper, options, (configSelector) => {
            if (this.channelzEnabled) {
                this.channelzTrace.addTrace('CT_INFO', 'Address resolution succeeded');
            }
            this.configSelector = configSelector;
            this.currentResolutionError = null;
            /* We process the queue asynchronously to ensure that the corresponding
             * load balancer update has completed. */
            process.nextTick(() => {
                const localQueue = this.configSelectionQueue;
                this.configSelectionQueue = [];
                this.callRefTimerUnref();
                for (const { callStream, callMetadata } of localQueue) {
                    this.tryGetConfig(callStream, callMetadata);
                }
                this.configSelectionQueue = [];
            });
        }, (status) => {
            if (this.channelzEnabled) {
                this.channelzTrace.addTrace('CT_WARNING', 'Address resolution failed with code ' + status.code + ' and details "' + status.details + '"');
            }
            if (this.configSelectionQueue.length > 0) {
                this.trace('Name resolution failed with calls queued for config selection');
            }
            if (this.configSelector === null) {
                this.currentResolutionError = Object.assign(Object.assign({}, restrictControlPlaneStatusCode(status.code, status.details)), { metadata: status.metadata });
            }
            const localQueue = this.configSelectionQueue;
            this.configSelectionQueue = [];
            this.callRefTimerUnref();
            for (const { callStream, callMetadata } of localQueue) {
                if (callMetadata.getOptions().waitForReady) {
                    this.callRefTimerRef();
                    this.configSelectionQueue.push({ callStream, callMetadata });
                }
                else {
                    callStream.cancelWithStatus(status.code, status.details);
                }
            }
        });
        this.filterStackFactory = new filter_stack_1.FilterStackFactory([
            new call_credentials_filter_1.CallCredentialsFilterFactory(this),
            new deadline_filter_1.DeadlineFilterFactory(this),
            new max_message_size_filter_1.MaxMessageSizeFilterFactory(this.options),
            new compression_filter_1.CompressionFilterFactory(this, this.options),
        ]);
        this.trace('Channel constructed with options ' + JSON.stringify(options, undefined, 2));
        const error = new Error();
        logging_1.trace(constants_1.LogVerbosity.DEBUG, 'channel_stacktrace', '(' + this.channelzRef.id + ') ' + 'Channel constructed \n' + ((_d = error.stack) === null || _d === void 0 ? void 0 : _d.substring(error.stack.indexOf('\n') + 1)));
    }
    getChannelzInfo() {
        return {
            target: this.originalTarget,
            state: this.connectivityState,
            trace: this.channelzTrace,
            callTracker: this.callTracker,
            children: this.childrenTracker.getChildLists()
        };
    }
    trace(text, verbosityOverride) {
        logging_1.trace(verbosityOverride !== null && verbosityOverride !== void 0 ? verbosityOverride : constants_1.LogVerbosity.DEBUG, 'channel', '(' + this.channelzRef.id + ') ' + uri_parser_1.uriToString(this.target) + ' ' + text);
    }
    callRefTimerRef() {
        var _a, _b, _c, _d;
        // If the hasRef function does not exist, always run the code
        if (!((_b = (_a = this.callRefTimer).hasRef) === null || _b === void 0 ? void 0 : _b.call(_a))) {
            this.trace('callRefTimer.ref | configSelectionQueue.length=' +
                this.configSelectionQueue.length +
                ' pickQueue.length=' +
                this.pickQueue.length);
            (_d = (_c = this.callRefTimer).ref) === null || _d === void 0 ? void 0 : _d.call(_c);
        }
    }
    callRefTimerUnref() {
        var _a, _b;
        // If the hasRef function does not exist, always run the code
        if (!this.callRefTimer.hasRef || this.callRefTimer.hasRef()) {
            this.trace('callRefTimer.unref | configSelectionQueue.length=' +
                this.configSelectionQueue.length +
                ' pickQueue.length=' +
                this.pickQueue.length);
            (_b = (_a = this.callRefTimer).unref) === null || _b === void 0 ? void 0 : _b.call(_a);
        }
    }
    pushPick(callStream, callMetadata, callConfig, dynamicFilters) {
        this.pickQueue.push({ callStream, callMetadata, callConfig, dynamicFilters });
        this.callRefTimerRef();
    }
    /**
     * Check the picker output for the given call and corresponding metadata,
     * and take any relevant actions. Should not be called while iterating
     * over pickQueue.
     * @param callStream
     * @param callMetadata
     */
    tryPick(callStream, callMetadata, callConfig, dynamicFilters) {
        var _a, _b;
        const pickResult = this.currentPicker.pick({
            metadata: callMetadata,
            extraPickInfo: callConfig.pickInformation,
        });
        const subchannelString = pickResult.subchannel ?
            '(' + pickResult.subchannel.getChannelzRef().id + ') ' + pickResult.subchannel.getAddress() :
            '' + pickResult.subchannel;
        this.trace('Pick result for call [' +
            callStream.getCallNumber() +
            ']: ' +
            picker_1.PickResultType[pickResult.pickResultType] +
            ' subchannel: ' +
            subchannelString +
            ' status: ' + ((_a = pickResult.status) === null || _a === void 0 ? void 0 : _a.code) +
            ' ' + ((_b = pickResult.status) === null || _b === void 0 ? void 0 : _b.details));
        switch (pickResult.pickResultType) {
            case picker_1.PickResultType.COMPLETE:
                if (pickResult.subchannel === null) {
                    callStream.cancelWithStatus(constants_1.Status.UNAVAILABLE, 'Request dropped by load balancing policy');
                    // End the call with an error
                }
                else {
                    /* If the subchannel is not in the READY state, that indicates a bug
                     * somewhere in the load balancer or picker. So, we log an error and
                     * queue the pick to be tried again later. */
                    if (pickResult.subchannel.getConnectivityState() !==
                        connectivity_state_1.ConnectivityState.READY) {
                        logging_1.log(constants_1.LogVerbosity.ERROR, 'Error: COMPLETE pick result subchannel ' +
                            subchannelString +
                            ' has state ' +
                            connectivity_state_1.ConnectivityState[pickResult.subchannel.getConnectivityState()]);
                        this.pushPick(callStream, callMetadata, callConfig, dynamicFilters);
                        break;
                    }
                    /* We need to clone the callMetadata here because the transparent
                     * retry code in the promise resolution handler use the same
                     * callMetadata object, so it needs to stay unmodified */
                    callStream.filterStack
                        .sendMetadata(Promise.resolve(callMetadata.clone()))
                        .then((finalMetadata) => {
                        var _a, _b, _c;
                        const subchannelState = pickResult.subchannel.getConnectivityState();
                        if (subchannelState === connectivity_state_1.ConnectivityState.READY) {
                            try {
                                const pickExtraFilters = pickResult.extraFilterFactories.map(factory => factory.createFilter(callStream));
                                (_a = pickResult.subchannel) === null || _a === void 0 ? void 0 : _a.getRealSubchannel().startCallStream(finalMetadata, callStream, [...dynamicFilters, ...pickExtraFilters]);
                                /* If we reach this point, the call stream has started
                                 * successfully */
                                (_b = callConfig.onCommitted) === null || _b === void 0 ? void 0 : _b.call(callConfig);
                                (_c = pickResult.onCallStarted) === null || _c === void 0 ? void 0 : _c.call(pickResult);
                            }
                            catch (error) {
                                const errorCode = error.code;
                                if (errorCode === 'ERR_HTTP2_GOAWAY_SESSION' ||
                                    errorCode === 'ERR_HTTP2_INVALID_SESSION') {
                                    /* An error here indicates that something went wrong with
                                     * the picked subchannel's http2 stream right before we
                                     * tried to start the stream. We are handling a promise
                                     * result here, so this is asynchronous with respect to the
                                     * original tryPick call, so calling it again is not
                                     * recursive. We call tryPick immediately instead of
                                     * queueing this pick again because handling the queue is
                                     * triggered by state changes, and we want to immediately
                                     * check if the state has already changed since the
                                     * previous tryPick call. We do this instead of cancelling
                                     * the stream because the correct behavior may be
                                     * re-queueing instead, based on the logic in the rest of
                                     * tryPick */
                                    this.trace('Failed to start call on picked subchannel ' +
                                        subchannelString +
                                        ' with error ' +
                                        error.message +
                                        '. Retrying pick', constants_1.LogVerbosity.INFO);
                                    this.tryPick(callStream, callMetadata, callConfig, dynamicFilters);
                                }
                                else {
                                    this.trace('Failed to start call on picked subchanel ' +
                                        subchannelString +
                                        ' with error ' +
                                        error.message +
                                        '. Ending call', constants_1.LogVerbosity.INFO);
                                    callStream.cancelWithStatus(constants_1.Status.INTERNAL, `Failed to start HTTP/2 stream with error: ${error.message}`);
                                }
                            }
                        }
                        else {
                            /* The logic for doing this here is the same as in the catch
                             * block above */
                            this.trace('Picked subchannel ' +
                                subchannelString +
                                ' has state ' +
                                connectivity_state_1.ConnectivityState[subchannelState] +
                                ' after metadata filters. Retrying pick', constants_1.LogVerbosity.INFO);
                            this.tryPick(callStream, callMetadata, callConfig, dynamicFilters);
                        }
                    }, (error) => {
                        // We assume the error code isn't 0 (Status.OK)
                        const { code, details } = restrictControlPlaneStatusCode(typeof error.code === 'number' ? error.code : constants_1.Status.UNKNOWN, `Getting metadata from plugin failed with error: ${error.message}`);
                        callStream.cancelWithStatus(code, details);
                    });
                }
                break;
            case picker_1.PickResultType.QUEUE:
                this.pushPick(callStream, callMetadata, callConfig, dynamicFilters);
                break;
            case picker_1.PickResultType.TRANSIENT_FAILURE:
                if (callMetadata.getOptions().waitForReady) {
                    this.pushPick(callStream, callMetadata, callConfig, dynamicFilters);
                }
                else {
                    const { code, details } = restrictControlPlaneStatusCode(pickResult.status.code, pickResult.status.details);
                    callStream.cancelWithStatus(code, details);
                }
                break;
            case picker_1.PickResultType.DROP:
                const { code, details } = restrictControlPlaneStatusCode(pickResult.status.code, pickResult.status.details);
                callStream.cancelWithStatus(code, details);
                break;
            default:
                throw new Error(`Invalid state: unknown pickResultType ${pickResult.pickResultType}`);
        }
    }
    removeConnectivityStateWatcher(watcherObject) {
        const watcherIndex = this.connectivityStateWatchers.findIndex((value) => value === watcherObject);
        if (watcherIndex >= 0) {
            this.connectivityStateWatchers.splice(watcherIndex, 1);
        }
    }
    updateState(newState) {
        logging_1.trace(constants_1.LogVerbosity.DEBUG, 'connectivity_state', '(' + this.channelzRef.id + ') ' +
            uri_parser_1.uriToString(this.target) +
            ' ' +
            connectivity_state_1.ConnectivityState[this.connectivityState] +
            ' -> ' +
            connectivity_state_1.ConnectivityState[newState]);
        if (this.channelzEnabled) {
            this.channelzTrace.addTrace('CT_INFO', connectivity_state_1.ConnectivityState[this.connectivityState] + ' -> ' + connectivity_state_1.ConnectivityState[newState]);
        }
        this.connectivityState = newState;
        const watchersCopy = this.connectivityStateWatchers.slice();
        for (const watcherObject of watchersCopy) {
            if (newState !== watcherObject.currentState) {
                if (watcherObject.timer) {
                    clearTimeout(watcherObject.timer);
                }
                this.removeConnectivityStateWatcher(watcherObject);
                watcherObject.callback();
            }
        }
        if (newState !== connectivity_state_1.ConnectivityState.TRANSIENT_FAILURE) {
            this.currentResolutionError = null;
        }
    }
    tryGetConfig(stream, metadata) {
        if (stream.getStatus() !== null) {
            /* If the stream has a status, it has already finished and we don't need
             * to take any more actions on it. */
            return;
        }
        if (this.configSelector === null) {
            /* This branch will only be taken at the beginning of the channel's life,
             * before the resolver ever returns a result. So, the
             * ResolvingLoadBalancer may be idle and if so it needs to be kicked
             * because it now has a pending request. */
            this.resolvingLoadBalancer.exitIdle();
            if (this.currentResolutionError && !metadata.getOptions().waitForReady) {
                stream.cancelWithStatus(this.currentResolutionError.code, this.currentResolutionError.details);
            }
            else {
                this.configSelectionQueue.push({
                    callStream: stream,
                    callMetadata: metadata,
                });
                this.callRefTimerRef();
            }
        }
        else {
            const callConfig = this.configSelector(stream.getMethod(), metadata);
            if (callConfig.status === constants_1.Status.OK) {
                if (callConfig.methodConfig.timeout) {
                    const deadline = new Date();
                    deadline.setSeconds(deadline.getSeconds() + callConfig.methodConfig.timeout.seconds);
                    deadline.setMilliseconds(deadline.getMilliseconds() +
                        callConfig.methodConfig.timeout.nanos / 1000000);
                    stream.setConfigDeadline(deadline);
                    // Refreshing the filters makes the deadline filter pick up the new deadline
                    stream.filterStack.refresh();
                }
                if (callConfig.dynamicFilterFactories.length > 0) {
                    /* These dynamicFilters are the mechanism for implementing gRFC A39:
                     * https://github.com/grpc/proposal/blob/master/A39-xds-http-filters.md
                     * We run them here instead of with the rest of the filters because
                     * that spec says "the xDS HTTP filters will run in between name
                     * resolution and load balancing".
                     *
                     * We use the filter stack here to simplify the multi-filter async
                     * waterfall logic, but we pass along the underlying list of filters
                     * to avoid having nested filter stacks when combining it with the
                     * original filter stack. We do not pass along the original filter
                     * factory list because these filters may need to persist data
                     * between sending headers and other operations. */
                    const dynamicFilterStackFactory = new filter_stack_1.FilterStackFactory(callConfig.dynamicFilterFactories);
                    const dynamicFilterStack = dynamicFilterStackFactory.createFilter(stream);
                    dynamicFilterStack.sendMetadata(Promise.resolve(metadata)).then(filteredMetadata => {
                        this.tryPick(stream, filteredMetadata, callConfig, dynamicFilterStack.getFilters());
                    });
                }
                else {
                    this.tryPick(stream, metadata, callConfig, []);
                }
            }
            else {
                const { code, details } = restrictControlPlaneStatusCode(callConfig.status, 'Failed to route call to method ' + stream.getMethod());
                stream.cancelWithStatus(code, details);
            }
        }
    }
    _startCallStream(stream, metadata) {
        this.tryGetConfig(stream, metadata.clone());
    }
    close() {
        this.resolvingLoadBalancer.destroy();
        this.updateState(connectivity_state_1.ConnectivityState.SHUTDOWN);
        clearInterval(this.callRefTimer);
        if (this.channelzEnabled) {
            channelz_1.unregisterChannelzRef(this.channelzRef);
        }
        this.subchannelPool.unrefUnusedSubchannels();
    }
    getTarget() {
        return uri_parser_1.uriToString(this.target);
    }
    getConnectivityState(tryToConnect) {
        const connectivityState = this.connectivityState;
        if (tryToConnect) {
            this.resolvingLoadBalancer.exitIdle();
        }
        return connectivityState;
    }
    watchConnectivityState(currentState, deadline, callback) {
        if (this.connectivityState === connectivity_state_1.ConnectivityState.SHUTDOWN) {
            throw new Error('Channel has been shut down');
        }
        let timer = null;
        if (deadline !== Infinity) {
            const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);
            const now = new Date();
            if (deadline === -Infinity || deadlineDate <= now) {
                process.nextTick(callback, new Error('Deadline passed without connectivity state change'));
                return;
            }
            timer = setTimeout(() => {
                this.removeConnectivityStateWatcher(watcherObject);
                callback(new Error('Deadline passed without connectivity state change'));
            }, deadlineDate.getTime() - now.getTime());
        }
        const watcherObject = {
            currentState,
            callback,
            timer,
        };
        this.connectivityStateWatchers.push(watcherObject);
    }
    /**
     * Get the channelz reference object for this channel. The returned value is
     * garbage if channelz is disabled for this channel.
     * @returns
     */
    getChannelzRef() {
        return this.channelzRef;
    }
    createCall(method, deadline, host, parentCall, propagateFlags) {
        if (typeof method !== 'string') {
            throw new TypeError('Channel#createCall: method must be a string');
        }
        if (!(typeof deadline === 'number' || deadline instanceof Date)) {
            throw new TypeError('Channel#createCall: deadline must be a number or Date');
        }
        if (this.connectivityState === connectivity_state_1.ConnectivityState.SHUTDOWN) {
            throw new Error('Channel has been shut down');
        }
        const callNumber = getNewCallNumber();
        this.trace('createCall [' +
            callNumber +
            '] method="' +
            method +
            '", deadline=' +
            deadline);
        const finalOptions = {
            deadline: deadline,
            flags: propagateFlags !== null && propagateFlags !== void 0 ? propagateFlags : constants_1.Propagate.DEFAULTS,
            host: host !== null && host !== void 0 ? host : this.defaultAuthority,
            parentCall: parentCall,
        };
        const stream = new call_stream_1.Http2CallStream(method, this, finalOptions, this.filterStackFactory, this.credentials._getCallCredentials(), callNumber);
        if (this.channelzEnabled) {
            this.callTracker.addCallStarted();
            stream.addStatusWatcher(status => {
                if (status.code === constants_1.Status.OK) {
                    this.callTracker.addCallSucceeded();
                }
                else {
                    this.callTracker.addCallFailed();
                }
            });
        }
        return stream;
    }
}
exports.ChannelImplementation = ChannelImplementation;
//# sourceMappingURL=channel.js.map