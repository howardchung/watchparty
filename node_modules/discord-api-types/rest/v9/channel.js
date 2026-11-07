"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactionType = void 0;
/**
 * @see {@link https://discord.com/developers/docs/resources/channel#get-reactions-reaction-types}
 */
var ReactionType;
(function (ReactionType) {
    ReactionType[ReactionType["Normal"] = 0] = "Normal";
    ReactionType[ReactionType["Burst"] = 1] = "Burst";
    // eslint-disable @typescript-eslint/no-duplicate-enum-values
    /**
     * @deprecated Use {@link ReactionType.Burst} instead
     */
    ReactionType[ReactionType["Super"] = 1] = "Super";
    // eslint-enable @typescript-eslint/no-duplicate-enum-values
})(ReactionType || (exports.ReactionType = ReactionType = {}));
//# sourceMappingURL=channel.js.map