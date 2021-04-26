import {expect} from "chai";
import "mocha";
import {getFileNameFromContentDispositionHeader as getFileName, getFileNameOrUrl, parseQueryString} from "./utils";

describe("utils", () => {
    describe("getFileNameFromCD", () => {
        it("must correctly parse Content-Disposition header", () => {
            expect(getFileName("attachment; filename=\"[sq]withquotes.torrent\""))
                .eq("[sq]withquotes.torrent");

            expect(getFileName("attachment; filename*=UTF-8''weird%20%23%20%80%20%3D%20%7B%20%7D%20%3B%20filename.txt"))
                .eq("weird # � = { } ; filename.txt");
        });
    });

    const testMagnetLink = "magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent";

    describe("parseQueryString", () => {
        it("magnet", () => {
            const qs = parseQueryString(testMagnetLink);
            expect(qs).to.have.property("dn").eql(['Big Buck Bunny']);
        });
    });

    describe("getFileNameOrUrl", () => {
        it("magnet", () => {
            expect(getFileNameOrUrl(testMagnetLink)).eq("Big Buck Bunny");
        });
    });

});
