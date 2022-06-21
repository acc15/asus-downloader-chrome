import "mocha";

import {expect} from "chai";
import {getFileNameByUrl} from "./urls";
import {getFileNameFromCD, isTorrentFile, normalizeUrl, parseQueryString} from "./utils";

export const testMagnetLink = "magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent";

describe("utils", () => {
    describe("getFileNameFromCD", () => {
        it("must correctly parse Content-Disposition header", () => {
            const expectations: {[k: string]: string } = {
                "attachment; filename=\"[sq]withquotes.torrent\"": "[sq]withquotes.torrent",
                "attachment; filename*=UTF-8''weird%20%23%20%80%20%3D%20%7B%20%7D%20%3B%20filename.txt": "weird # � = { } ; filename.txt",
                "attachment; filename=\"Alpine%20Raspberry%20Pi%203.16.0%20aarch64%20TAR%20GZ.torrent\"": "Alpine Raspberry Pi 3.16.0 aarch64 TAR GZ.torrent",
            }

            for (const k in expectations) {
                expect(getFileNameFromCD(k)).eq(expectations[k]);
            }
        });

        it("must return null on null string", () => {
            expect(getFileNameFromCD(null)).is.null;
        });
    });

    describe("parseQueryString", () => {
        it("magnet", () => {
            const qs = parseQueryString(testMagnetLink);
            expect(qs.get("dn")).eq('Big Buck Bunny');
        });
    });

    describe("getFileNameOrUrl", () => {
        it("magnet", () => {
            expect(getFileNameByUrl(testMagnetLink)).eq("Big Buck Bunny");
        });
    });

    describe("isTorrentFile", () => {
        it("must correctly detect .torrent files", () => {

            const expectations: Array<[string, string, boolean]> = [
                ["application/x-bittorrent", "abc.torrent", true],
                ["application/octet_stream", "Complex name.torrent", true],
                ["haha", "abc.torrent", false],
                ["application/x-bittorrent", "test.txt", false]
            ];

            for (const expectation of expectations) {
                expect(isTorrentFile(expectation[0], expectation[1])).eq(expectation[2]);
            }

        });
    });

    describe("normalizeUrl", () => {

        it("must correctly normalize urls", () => {
            const expectations: { [k: string]: string } = {
                "http://abc////": "http://abc",
                "http://abc/": "http://abc",
                "http://abc": "http://abc"
            }

            for (const k in expectations) {
                expect(normalizeUrl(k)).eq(expectations[k]);
            }
        });
    });

});
