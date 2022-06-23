import {expect} from "chai";
import {getFileNameByUrl} from "./url";
import {isTorrentFile, parseQueryString} from "./util";

export const testMagnetLink = "magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent";
export const testMagnetLink2 = "magnet:?xt=urn:btih:B530C9909720F4B8583B020630B6DF068976E75E&dn=%E6%9C%AA%E5%AE%9F%E8%A3%85%E3%81%AE%E3%83%A9%E3%82%B9%E3%83%9C%E3%82%B9%E9%81%94%E3%81%8C%E4%BB%B2%E9%96%93%E3%81%AB%E3%81%AA%E3%82%8A%E3%81%BE%E3%81%97%E3%81%9F%E3%80%82+%E7%AC%AC01%E5%B7%BB+%5BMijisso+no+rasubosutachi+ga+nakama+ni+narimashita+vol+01%5D&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce&tr=udp%3A%2F%2Fretracker.lanta-net.ru%3A2710%2Fannounce&tr=udp%3A%2F%2Fipv4.tracker.harry.lu%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fipv6.tracker.harry.lu%3A80%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.to%3A2710%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.open-internet.nl%3A6969%2Fannounce&tr=udp%3A%2F%2Fopen.demonii.si%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.pirateparty.gr%3A6969%2Fannounce&tr=udp%3A%2F%2Fdenis.stalker.upeer.me%3A6969%2Fannounce&tr=udp%3A%2F%2Fp4p.arenabg.com%3A1337%2Fannounce";

describe("utils", () => {

    describe("parseQueryString", () => {
        it("magnet", () => {
            const qs = parseQueryString(testMagnetLink);
            expect(qs.get("dn")).eq('Big Buck Bunny');
        });
    });

    describe("getFileNameOrUrl", () => {
        it("magnet", () => {
            expect(getFileNameByUrl(testMagnetLink)).eq("Big Buck Bunny");
            expect(getFileNameByUrl(testMagnetLink2)).eq("未実装のラスボス達が仲間になりました。 第01巻 [Mijisso no rasubosutachi ga nakama ni narimashita vol 01]");
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

});
