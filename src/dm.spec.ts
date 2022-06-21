import "mocha";
import {expect} from "chai";
import {QueueStatus, responseTextToStatus} from "./dm";

describe("dm", () => {
    describe("responseTextToStatus", () => {

        const expectations: { [k: string]: QueueStatus } = {
            '<script>parent.hideLoading();parent.response_dm_add("BT_EXIST");</script>': QueueStatus.Exists,
            '<script>parent.response_dm_add("ACK_SUCESS");</script>': QueueStatus.Ok,
            '<script>parent.hideLoading();parent.response_dm_add("BT_ACK_SUCESS=");</script>': QueueStatus.ConfirmFiles,
            '<script>parent.hideLoading();parent.response_dm_add("DISK_FULL");</script>': QueueStatus.DiskFull,
            '<script>parent.hideLoading();parent.response_dm_add("TOTAL_FULL");</script>': QueueStatus.TaskLimit
        }

        for (const k in expectations) {
            const status = expectations[k];
            it("must correctly detect " + status + " status", () => {
                expect(responseTextToStatus(k)).eq(status);
            });
        }

    });
});
