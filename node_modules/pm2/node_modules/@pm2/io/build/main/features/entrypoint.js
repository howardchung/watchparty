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
