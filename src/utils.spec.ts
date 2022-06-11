import {expect} from "chai";
import "mocha";
import {getFileNameFromCD, getFileNameOrUrl, isTorrentFile, parseQueryString} from "./utils";

describe("utils", () => {
    describe("getFileNameFromCD", () => {
        it("must correctly parse Content-Disposition header", () => {
            expect(getFileNameFromCD("attachment; filename=\"[sq]withquotes.torrent\""))
                .eq("[sq]withquotes.torrent");

            expect(getFileNameFromCD("attachment; filename*=UTF-8''weird%20%23%20%80%20%3D%20%7B%20%7D%20%3B%20filename.txt"))
                .eq("weird # � = { } ; filename.txt");

            expect(getFileNameFromCD("attachment; filename=\"Alpine%20Raspberry%20Pi%203.16.0%20aarch64%20TAR%20GZ.torrent\""))
                .eq("Alpine Raspberry Pi 3.16.0 aarch64 TAR GZ.torrent")

            expect(getFileNameFromCD(null)).eq(null);
        });
    });

    const testMagnetLink = "magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent";

    describe("parseQueryString", () => {
        it("magnet", () => {
            const qs = parseQueryString(testMagnetLink);
            expect(qs.get("dn")).eq('Big Buck Bunny');
        });
    });

    describe("getFileNameOrUrl", () => {
        it("magnet", () => {
            expect(getFileNameOrUrl(testMagnetLink)).eq("Big Buck Bunny");
        });
    });

    describe("isTorrentFile", () => {
        it("must correctly detect .torrent files", () => {
            expect(isTorrentFile("application/x-bittorrent", "abc.torrent")).is.true;
            expect(isTorrentFile("application/octet_stream", "Complex name.torrent")).is.true;
            expect(isTorrentFile("haha", "abc.torrent")).is.false;
            expect(isTorrentFile("application/x-bittorrent", "test.txt")).is.false;
        });
    });

});
