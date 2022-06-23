import {expect} from "chai";
import {responseTextToStatus} from "./dm";
import {Status} from "./status";

describe("dm", () => {
    describe("responseTextToStatus", () => {

        const expectations: { [k: string]: Status } = {
            '<script>parent.hideLoading();parent.response_dm_add("BT_EXIST");</script>': Status.Exists,
            '<script>parent.response_dm_add("ACK_SUCESS");</script>': Status.Ok,
            '<script>parent.hideLoading();parent.response_dm_add("BT_ACK_SUCESS=");</script>': Status.ConfirmFiles,
            '<script>parent.hideLoading();parent.response_dm_add("DISK_FULL");</script>': Status.DiskFull,
            '<script>parent.hideLoading();parent.response_dm_add("TOTAL_FULL");</script>': Status.TaskLimit,
            '<script>parent.hideLoading();parent.response_dm_add("ACK_FAIL");</script>': Status.Error
        }

        for (const k in expectations) {
            const status = expectations[k];
            it("must correctly detect " + status + " status", () => {
                expect(responseTextToStatus(k)).eq(status);
            });
        }

    });
});
