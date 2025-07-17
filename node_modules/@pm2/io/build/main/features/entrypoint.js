"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entrypoint = void 0;
const IO_KEY = Symbol.for('@pm2/io');
class Entrypoint {
    constructor() {
        try {
            this.io = global[IO_KEY].init(this.conf());
            this.onStart(err => {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                this.sensors();
                this.events();
                this.actuators();
                this.io.onExit((code, signal) => {
                    this.onStop(err, () => {
                        this.io.destroy();
                    }, code, signal);
                });
                if (process && process.send)
                    process.send('ready');
            });
        }
        catch (e) {
            if (this.io) {
                this.io.destroy();
            }
            throw (e);
        }
    }
    events() {
        return;
    }
    sensors() {
        return;
    }
    actuators() {
        return;
    }
    onStart(cb) {
        throw new Error('Entrypoint onStart() not specified');
    }
    onStop(err, cb, code, signal) {
        return cb();
    }
    conf() {
        return undefined;
    }
}
exports.Entrypoint = Entrypoint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlwb2ludC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9lbnRyeXBvaW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7QUFFcEMsTUFBYSxVQUFVO0lBR3JCO1FBQ0UsSUFBSTtZQUNGLElBQUksQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtZQUUxQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNqQixJQUFJLEdBQUcsRUFBRTtvQkFDUCxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO29CQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO2lCQUNoQjtnQkFFRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7Z0JBQ2QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO2dCQUNiLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQTtnQkFFaEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTt3QkFDcEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtvQkFDbkIsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQTtnQkFDbEIsQ0FBQyxDQUFDLENBQUE7Z0JBRUYsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLElBQUk7b0JBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUNwRCxDQUFDLENBQUMsQ0FBQTtTQUNIO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFFVixJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTthQUNsQjtZQUVELE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtTQUNWO0lBQ0gsQ0FBQztJQUVELE1BQU07UUFDSixPQUFNO0lBQ1IsQ0FBQztJQUVELE9BQU87UUFDTCxPQUFNO0lBQ1IsQ0FBQztJQUVELFNBQVM7UUFDUCxPQUFNO0lBQ1IsQ0FBQztJQUVELE9BQU8sQ0FBRSxFQUFZO1FBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsb0NBQW9DLENBQUMsQ0FBQTtJQUN2RCxDQUFDO0lBRUQsTUFBTSxDQUFFLEdBQVUsRUFBRSxFQUFZLEVBQUUsSUFBWSxFQUFFLE1BQWM7UUFDNUQsT0FBTyxFQUFFLEVBQUUsQ0FBQTtJQUNiLENBQUM7SUFFRCxJQUFJO1FBQ0YsT0FBTyxTQUFTLENBQUE7SUFDbEIsQ0FBQztDQUNGO0FBMURELGdDQTBEQyJ9