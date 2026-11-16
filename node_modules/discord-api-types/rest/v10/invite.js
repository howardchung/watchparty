"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteTargetUsersJobStatus = void 0;
/**
 * @see {@link https://docs.discord.com/developers/resources/invite#get-target-users-job-status}
 */
var InviteTargetUsersJobStatus;
(function (InviteTargetUsersJobStatus) {
    /**
     * The default value.
     */
    InviteTargetUsersJobStatus[InviteTargetUsersJobStatus["Unspecified"] = 0] = "Unspecified";
    /**
     * The job is still being processed.
     */
    InviteTargetUsersJobStatus[InviteTargetUsersJobStatus["Processing"] = 1] = "Processing";
    /**
     * The job has been completed successfully.
     */
    InviteTargetUsersJobStatus[InviteTargetUsersJobStatus["Completed"] = 2] = "Completed";
    /**
     * The job has failed; see `error_message` field for more details.
     */
    InviteTargetUsersJobStatus[InviteTargetUsersJobStatus["Failed"] = 3] = "Failed";
})(InviteTargetUsersJobStatus || (exports.InviteTargetUsersJobStatus = InviteTargetUsersJobStatus = {}));
//# sourceMappingURL=invite.js.map