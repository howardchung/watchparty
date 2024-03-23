"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serviceManager_1 = require("../serviceManager");
class MiscUtils {
    static generateUUID() {
        return Math.random().toString(36).substr(2, 16);
    }
    static getValueFromDump(property, parentProperty) {
        if (!parentProperty) {
            parentProperty = 'handles';
        }
        const dump = serviceManager_1.ServiceManager.get('eventLoopService').inspector.dump();
        return dump[parentProperty].hasOwnProperty(property) ? dump[parentProperty][property].length : 0;
    }
}
exports.default = MiscUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlzY2VsbGFuZW91cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9taXNjZWxsYW5lb3VzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0RBQWtEO0FBRWxELE1BQXFCLFNBQVM7SUFDNUIsTUFBTSxDQUFDLFlBQVk7UUFDakIsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDakQsQ0FBQztJQUVELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBRSxRQUFRLEVBQUUsY0FBZTtRQUNoRCxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ25CLGNBQWMsR0FBRyxTQUFTLENBQUE7U0FDM0I7UUFDRCxNQUFNLElBQUksR0FBRywrQkFBYyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUNwRSxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNsRyxDQUFDO0NBQ0Y7QUFaRCw0QkFZQyJ9