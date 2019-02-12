import {expect} from 'chai';
import "mocha";
import {getFileNameFromCD} from "./utils";

describe("utils", () => {
    describe("getFileNameFromCD", () => {
        it("must correctly parse Content-Disposition header", () => {
            expect(getFileNameFromCD("attachment; filename=[limetorrents.info]Will.and.Grace.S10E10.720p.WEB.x264-300MB.torrent"))
                .eq("[limetorrents.info]Will.and.Grace.S10E10.720p.WEB.x264-300MB.torrent");
        });
    });

});
