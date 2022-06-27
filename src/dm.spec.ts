import {expect} from "chai";
import {ConfirmFiles, parseConfirmFiles, responseTextToStatus} from "./dm";
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

    describe("parseConfirmFiles", () => {

        const expectations: { [k: string]: ConfirmFiles } = {
            '<script>parent.hideLoading();parent.response_dm_add("BT_ACK_SUCESS=[WORLD PG ANIME] 母がダークエルフになって異世界から戻ってきた。 ～エロエロできちゃう親子関係～ PLAY MOVIE, #[LimeTorrents.lol][WORLD.PG.ANIME].母がダークエルフになって異世界から戻ってきた。.～エロエロできちゃう.torrent, #0#none#233MB#ANP-115_MainMovie(WMV).wmv");</script>': {
                name: "[LimeTorrents.lol][WORLD.PG.ANIME].母がダークエルフになって異世界から戻ってきた。.～エロエロできちゃう.torrent",
                files: [
                    { index: 0, size: "233MB", name: "ANP-115_MainMovie(WMV).wmv" }
                ]
            },
            '<script>parent.hideLoading();parent.response_dm_add("BT_ACK_SUCESS=[WORLD PG ANIME] マイクロ水着×どすけべ奥さんズ～豊満ボディのえちちな誘惑～PLAY MOVIE, #[LimeTorrents.lol][WORLD.PG.ANIME].マイクロ水着×どすけべ奥さんズ～豊満ボディのえちちな誘惑～PLAY.MOVIE.torrent, #0#none#0KB#Visit us for more Hentais!.txt, #1#none#959MB#anp-151.mp4");</script>': {
                name: "[LimeTorrents.lol][WORLD.PG.ANIME].マイクロ水着×どすけべ奥さんズ～豊満ボディのえちちな誘惑～PLAY.MOVIE.torrent",
                files: [
                    { index: 0, size: "0KB", name: "Visit us for more Hentais!.txt" },
                    { index: 1, size: "959MB", name: "anp-151.mp4" }
                ]
            },
            '<script>parent.hideLoading();parent.response_dm_add("BT_ACK_SUCESS=, #(NewAge Ambient) Shogo - Canticle For Seraphim (2010) [MP3, 320 kbps] [rutracker-4917315].torrent, #0#none#10MB#01 - Morphing Thru Realities.mp3, #1#none#14MB#02 - Canticle For Seraphim (Tribute Version).mp3, #2#none#14MB#03 - Revenant.mp3, #3#none#22MB#04 - Feast After Dark.mp3, #4#none#14MB#05 - Absence Of Peace.mp3, #5#none#0MB#Folder.jpg");</script>': {
                name: "(NewAge Ambient) Shogo - Canticle For Seraphim (2010) [MP3, 320 kbps] [rutracker-4917315].torrent",
                files: [
                    { index: 0, size: "10MB", name: "01 - Morphing Thru Realities.mp3" },
                    { index: 1, size: "14MB", name: "02 - Canticle For Seraphim (Tribute Version).mp3" },
                    { index: 2, size: "14MB", name: "03 - Revenant.mp3" },
                    { index: 3, size: "22MB", name: "04 - Feast After Dark.mp3" },
                    { index: 4, size: "14MB", name: "05 - Absence Of Peace.mp3" },
                    { index: 5, size:" 0MB", name: "Folder.jpg" },
                ]
            }
        };

        for (const k in expectations) {
            const files = expectations[k];
            it("must correctly parse: " + k, () => {
                expect(parseConfirmFiles(k)).deep.eq(files);
            });
        }

    });
});
