import {expect} from "chai";
import {
    getFileNameFromContentDisposition,
    parseContentDisposition
} from "./content-disposition";
import {dataDeepEq, dataDriven, dataEq} from "../test-util.spec";

describe("content-disposition", () => {

    describe("parseContentDisposition", () => dataDeepEq([
        { data: 'inline', expect: { type: "inline", params: {} } },
        { data: 'inline ; ', expect: { type: "inline", params: {} } },
        { data: 'attachment', expect: { type: "attachment", params: {} } },
        { data: 'attachment; filename="filename.jpg"', expect: { type: "attachment", params: { filename: { value: "filename.jpg" } } } },
        { data: 'form-data', expect: { type: "form-data", params: {} } },
        { data: 'form-data ; name="fieldName"', expect: { type: "form-data", params: { name: { value:"fieldName" } } } },
        { data: 'form-data; name="fieldName"; filename="filename.jpg"', expect: { type: "form-data", params: { name: { value: "fieldName" }, filename: { value: "filename.jpg" } } } },
        {
            data: "attachment ; filename=\"[rutracker.org].t3400938.torrent\"; filename*=UTF-8''%D0%92%D0%BE%D1%80%D0%BE%D0%BD%D0%B8%D0%BD%D1%8B%20%D0%A1%D0%B5%D0%B7%D0%BE%D0%BD%208%20%D0%A1%D0%B5%D1%80%D0%B8%D0%B8%201-20%20%D0%B8%D0%B7%2020%20%28141-160%20%D0%B8%D0%B7%20160%29%20%28%D0%90%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80%20%D0%96%D0%B8%D0%B3%D0%B0%D0%BB%D0%BA%D0%B8%D0%BD%29%20%5B2011%2C%20%D0%BA%D0%BE%D0%BC%D0%B5%D0%B4%D0%B8%D1%8F%2C%20%D1%81%D0%B5%D0%BC%D0%B5%D0%B9%D0%BD%D0%BE%D0%B5%20%D0%BA%D0%B8%D0%BD%D0%BE%2C%20IPTVRip%5D%20%5Brutracker-3400938%5D.torrent",
            expect: {
                type: "attachment",
                params: {
                    filename: {
                        value: "[rutracker.org].t3400938.torrent",
                        extValue: "Воронины Сезон 8 Серии 1-20 из 20 (141-160 из 160) (Александр Жигалкин) [2011, комедия, семейное кино, IPTVRip] [rutracker-3400938].torrent",
                        encoding: "UTF-8",
                        language: ""
                    }
                }
            }
        },
        {
            data: "attachment; filename=\"[sq]withquotes.torrent\"",
            expect: { type: "attachment", params: {filename: {value: "[sq]withquotes.torrent"}} }
        },
        {
            data: "attachment; filename*=UTF-8''weird%20%23%20%80%20%3D%20%7B%20%7D%20%3B%20filename.txt",
            expect: {
                type: "attachment",
                params: {
                    filename: {
                        encoding: "UTF-8",
                        language: "",
                        extValue: "weird # � = { } ; filename.txt"
                    }
                }
            }
        },
        {
            data: "attachment; filename=\"Alpine%20Raspberry%20Pi%203.16.0%20aarch64%20TAR%20GZ.torrent\"",
            expect: {
                type: "attachment",
                params: {
                    filename: {
                        value: "Alpine Raspberry Pi 3.16.0 aarch64 TAR GZ.torrent"
                    }
                }
            }
        },
        {
            data: "  weird case ;=empty param",
            expect: {
                type: "weird case",
                params: {
                    "": {value: "empty param"}
                }
            }
        },
        {
            data: "empty ext param; * = UTF-8'en'ext ; = val ",
            expect: {
                type: "empty ext param",
                params: {
                    "": {value: "val", encoding: "UTF-8", language: "en", extValue: "ext"}
                }
            }
        },
        {
            data: "unknown encoding;* = enc'en'ext",
            expect: {
                type: "unknown encoding",
                params: {
                    "": {encoding: "enc", language: "en", extValue: "ext"}
                }
            }
        },
        {
            data: "attachment; filename=\"filename with ; semicolon.txt\"",
            expect: {
                type: "attachment",
                params: {
                    filename: {value: "filename with ; semicolon.txt"}
                }
            }
        },
        {
            data: "atTaChMeNT  ; caseInsens=\"value\" ; cAsEInSenS* = utf-8''extValue",
            expect: {
                type: "attachment",
                params: {
                    caseinsens: {value: "value", extValue: "extValue", encoding: "utf-8", language: ""}
                }
            }
        },
        {
            data: "inline; filename=\"%E3%81%82%E3%81%AE%E3%81%A8%E3%81%8D%E3%82%AD%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8A%E3%81%91%E3%81%AF%E3%82%99%20%E3%82%AA%E3%83%AA%E3%82%B7%E3%82%99%E3%83%8A%E3%83%AB%E3%83%BB%E3%82%B5%E3%82%A6%E3%83%B3%E3%83%88%E3%82%99%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF.torrent\"; filename*=UTF-8''%E3%81%82%E3%81%AE%E3%81%A8%E3%81%8D%E3%82%AD%E3%82%B9%E3%81%97%E3%81%A6%E3%81%8A%E3%81%91%E3%81%AF%E3%82%99%20%E3%82%AA%E3%83%AA%E3%82%B7%E3%82%99%E3%83%8A%E3%83%AB%E3%83%BB%E3%82%B5%E3%82%A6%E3%83%B3%E3%83%88%E3%82%99%E3%83%88%E3%83%A9%E3%83%83%E3%82%AF.torrent",
            expect: {
                type: "inline",
                params: {
                    filename: {
                        value: 'あのときキスしておけば オリジナル・サウンドトラック.torrent',
                        extValue: 'あのときキスしておけば オリジナル・サウンドトラック.torrent',
                        encoding: "UTF-8",
                        language: ""
                    }
                }
            }
        },
        {
            data: 'attachment; filename=[LimeTorrents.lol][WORLD.PG.ANIME].æ¯\x8Dã\x81\x8Cã\x83\x80ã\x83¼ã\x82¯ã\x82¨ã\x83«ã\x83\x95ã\x81«ã\x81ªã\x81£ã\x81¦ç\x95°ä¸\x96ç\x95\x8Cã\x81\x8Bã\x82\x89æ\x88»ã\x81£ã\x81¦ã\x81\x8Dã\x81\x9Fã\x80\x82.ï½\x9Eã\x82¨ã\x83­ã\x82¨ã\x83­ã\x81§ã\x81\x8Dã\x81¡ã\x82\x83ã\x81\x86.torrent',
            expect: {
                type: "attachment",
                params: {
                    filename: {
                        value: '[LimeTorrents.lol][WORLD.PG.ANIME].母がダークエルフになって異世界から戻ってきた。.～エロエロできちゃう.torrent'
                    }
                }
            }
        },
        {
            data: 'attachment; filename=Тест.torrent',
            expect: {
                type: "attachment",
                params: {
                    filename: {
                        value: 'Тест.torrent'
                    }
                }
            }
        }], parseContentDisposition)
    );

    describe("getFileNameFromContentDisposition", () => dataEq([
        { data: "attachment; filename=\"[sq]withquotes.torrent\"", expect: "[sq]withquotes.torrent" },
        { data: "attachment; filename*=UTF-8''weird%20%23%20%80%20%3D%20%7B%20%7D%20%3B%20filename.txt", expect: "weird # � = { } ; filename.txt" },
        { data: "attachment; filename=\"Alpine%20Raspberry%20Pi%203.16.0%20aarch64%20TAR%20GZ.torrent\"", expect: "Alpine Raspberry Pi 3.16.0 aarch64 TAR GZ.torrent" },
        { data: 'attachment; filename=[LimeTorrents.lol][WORLD.PG.ANIME].æ¯\x8Dã\x81\x8Cã\x83\x80ã\x83¼ã\x82¯ã\x82¨ã\x83«ã\x83\x95ã\x81«ã\x81ªã\x81£ã\x81¦ç\x95°ä¸\x96ç\x95\x8Cã\x81\x8Bã\x82\x89æ\x88»ã\x81£ã\x81¦ã\x81\x8Dã\x81\x9Fã\x80\x82.ï½\x9Eã\x82¨ã\x83­ã\x82¨ã\x83­ã\x81§ã\x81\x8Dã\x81¡ã\x82\x83ã\x81\x86.torrent', expect: '[LimeTorrents.lol][WORLD.PG.ANIME].母がダークエルフになって異世界から戻ってきた。.～エロエロできちゃう.torrent' },
        { data: "attachment", expect: null },
        { data: null, expect: null }
    ], d => getFileNameFromContentDisposition(d)));

});