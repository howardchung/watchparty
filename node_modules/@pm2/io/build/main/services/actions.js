"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionService = exports.Action = void 0;
const serviceManager_1 = require("../serviceManager");
const Debug = require("debug");
class Action {
}
exports.Action = Action;
class ActionService {
    constructor() {
        this.timer = undefined;
        this.transport = undefined;
        this.actions = new Map();
        this.logger = Debug('axm:services:actions');
    }
    listener(data) {
        this.logger(`Received new message from reverse`);
        if (!data)
            return false;
        const actionName = data.msg ? data.msg : data.action_name ? data.action_name : data;
        let action = this.actions.get(actionName);
        if (typeof action !== 'object') {
            return this.logger(`Received action ${actionName} but failed to find the implementation`);
        }
        if (!action.isScoped) {
            this.logger(`Succesfully called custom action ${action.name} with arity ${action.handler.length}`);
            if (action.handler.length === 2) {
                let params = {};
                if (typeof data === 'object') {
                    params = data.opts;
                }
                return action.handler(params, action.callback);
            }
            return action.handler(action.callback);
        }
        if (data.uuid === undefined) {
            return this.logger(`Received scoped action ${action.name} but without uuid`);
        }
        const stream = {
            send: (dt) => {
                this.transport.send('axm:scoped_action:stream', {
                    data: dt,
                    uuid: data.uuid,
                    action_name: actionName
                });
            },
            error: (dt) => {
                this.transport.send('axm:scoped_action:error', {
                    data: dt,
                    uuid: data.uuid,
                    action_name: actionName
                });
            },
            end: (dt) => {
                this.transport.send('axm:scoped_action:end', {
                    data: dt,
                    uuid: data.uuid,
                    action_name: actionName
                });
            }
        };
        this.logger(`Succesfully called scoped action ${action.name}`);
        return action.handler(data.opts || {}, stream);
    }
    init() {
        this.transport = serviceManager_1.ServiceManager.get('transport');
        if (this.transport === undefined) {
            return this.logger(`Failed to load transport service`);
        }
        this.actions.clear();
        this.transport.on('data', this.listener.bind(this));
    }
    destroy() {
        if (this.timer !== undefined) {
            clearInterval(this.timer);
        }
        if (this.transport !== undefined) {
            this.transport.removeListener('data', this.listener.bind(this));
        }
    }
    registerAction(actionName, opts, handler) {
        if (typeof opts === 'function') {
            handler = opts;
            opts = undefined;
        }
        if (typeof actionName !== 'string') {
            console.error(`You must define an name when registering an action`);
            return;
        }
        if (typeof handler !== 'function') {
            console.error(`You must define an callback when registering an action`);
            return;
        }
        if (this.transport === undefined) {
            return this.logger(`Failed to load transport service`);
        }
        let type = 'custom';
        if (actionName.indexOf('km:') === 0 || actionName.indexOf('internal:') === 0) {
            type = 'internal';
        }
        const reply = (data) => {
            this.transport.send('axm:reply', {
                at: new Date().getTime(),
                action_name: actionName,
                return: data
            });
        };
        const action = {
            name: actionName,
            callback: reply,
            handler,
            type,
            isScoped: false,
            arity: handler.length,
            opts
        };
        this.logger(`Succesfully registered custom action ${action.name}`);
        this.actions.set(actionName, action);
        this.transport.addAction(action);
    }
    scopedAction(actionName, handler) {
        if (typeof actionName !== 'string') {
            console.error(`You must define an name when registering an action`);
            return -1;
        }
        if (typeof handler !== 'function') {
            console.error(`You must define an callback when registering an action`);
            return -1;
        }
        if (this.transport === undefined) {
            return this.logger(`Failed to load transport service`);
        }
        const action = {
            name: actionName,
            handler,
            type: 'scoped',
            isScoped: true,
            arity: handler.length,
            opts: null
        };
        this.logger(`Succesfully registered scoped action ${action.name}`);
        this.actions.set(actionName, action);
        this.transport.addAction(action);
    }
}
exports.ActionService = ActionService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2aWNlcy9hY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNEQUFrRDtBQUVsRCwrQkFBOEI7QUFFOUIsTUFBYSxNQUFNO0NBUWxCO0FBUkQsd0JBUUM7QUFFRCxNQUFhLGFBQWE7SUFBMUI7UUFFVSxVQUFLLEdBQTZCLFNBQVMsQ0FBQTtRQUMzQyxjQUFTLEdBQTBCLFNBQVMsQ0FBQTtRQUM1QyxZQUFPLEdBQXdCLElBQUksR0FBRyxFQUFrQixDQUFBO1FBQ3hELFdBQU0sR0FBYSxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtJQWlLMUQsQ0FBQztJQS9KUyxRQUFRLENBQUUsSUFBSTtRQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLG1DQUFtQyxDQUFDLENBQUE7UUFDaEQsSUFBSSxDQUFDLElBQUk7WUFBRSxPQUFPLEtBQUssQ0FBQTtRQUV2QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUE7UUFDbkYsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDekMsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7WUFDOUIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixVQUFVLHdDQUF3QyxDQUFDLENBQUE7U0FDMUY7UUFHRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLG9DQUFvQyxNQUFNLENBQUMsSUFBSSxlQUFlLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtZ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