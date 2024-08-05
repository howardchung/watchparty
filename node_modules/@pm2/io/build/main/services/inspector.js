"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectorService = void 0;
const inspector = require("inspector");
const debug_1 = require("debug");
class InspectorService {
    constructor() {
        this.session = null;
        this.logger = (0, debug_1.default)('axm:services:inspector');
    }
    init() {
        this.logger(`Creating new inspector session`);
        this.session = new inspector.Session();
        this.session.connect();
        this.logger('Connected to inspector');
        this.session.post('Profiler.enable');
        this.session.post('HeapProfiler.enable');
        return this.session;
    }
    getSession() {
        if (this.session === null) {
            this.session = this.init();
            return this.session;
        }
        else {
            return this.session;
        }
    }
    destroy() {
        if (this.session !== null) {
            this.session.post('Profiler.disable');
            this.session.post('HeapProfiler.disable');
            this.session.disconnect();
            this.session = null;
        }
        else {
            this.logger('No open session');
        }
    }
}
exports.InspectorService = InspectorService;
module.exports = InspectorService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zcGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2VzL2luc3BlY3Rvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBc0M7QUFDdEMsaUNBQXlCO0FBRXpCLE1BQWEsZ0JBQWdCO0lBQTdCO1FBRVUsWUFBTyxHQUE2QixJQUFJLENBQUE7UUFDeEMsV0FBTSxHQUFhLElBQUEsZUFBSyxFQUFDLHdCQUF3QixDQUFDLENBQUE7SUErQjVELENBQUM7SUE3QkMsSUFBSTtRQUNGLElBQUksQ0FBQyxNQUFNLENBQUMsZ0NBQWdDLENBQUMsQ0FBQTtRQUM3QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ3RDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7UUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO1FBQ3JDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUE7UUFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQTtRQUN4QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUE7SUFDckIsQ0FBQztJQUVELFVBQVU7UUFDUixJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFFO1lBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO1lBQzFCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtTQUNwQjthQUFNO1lBQ0wsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFBO1NBQ3BCO0lBQ0gsQ0FBQztJQUVELE9BQU87UUFDTCxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFFO1lBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUE7WUFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtZQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFBO1lBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO1NBQ3BCO2FBQU07WUFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUE7U0FDL0I7SUFDSCxDQUFDO0NBQ0Y7QUFsQ0QsNENBa0NDO0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQSJ9