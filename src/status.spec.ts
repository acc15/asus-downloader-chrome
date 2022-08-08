import {expect} from "chai";
import Status from "./status";

describe("status", () => {

    it("must have valid names", () => {
        expect(Status.AddTask.name).eq("AddTask");
        expect(Status.TorrentDownload.name).eq("TorrentDownload");
    });

    it("must correctly format", () => {
        expect(Status.AddTask.toString(57)).eq("AddTask:57");
    });

});