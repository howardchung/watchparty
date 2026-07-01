"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapperContext = void 0;
class MapperContext {
    constructor() { }
    static getInstance() {
        if (!MapperContext.instance) {
            MapperContext.instance = new MapperContext();
        }
        return MapperContext.instance;
    }
    setStrategy(strategy) {
        this.strategy = strategy;
    }
    getHamFormat(manifest) {
        return this.strategy.toHam(manifest);
    }
    getManifestFormat(presentation) {
        return this.strategy.toManifest(presentation);
    }
    getManifestMetadata() {
        return this.strategy.getManifestMetadata();
    }
}
exports.MapperContext = MapperContext;
//# sourceMappingURL=MapperContext.js.map