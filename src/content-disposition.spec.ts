import "mocha";

import {expect} from "chai";
import {
    CharIterator,
    ContentDisposition,
    decodePercent,
    decodeToken,
    eatToken,
    getFileNameFromContentDisposition,
    parseContentDisposition
} from "./content-disposition";

describe("content-disposition", () => {

    it("decodePercent", () => {
        expect(decodePercent(new CharIterator("%D1%82%D0%B5%D1%81%D1%82%D0%BE%D0%B2%D0%B0%D1%8F %D1%81%D1%82%D1%80%D0%BE%D0%BA%D0%B0. And some letters - also!"), false, "utf-8"))
            .eq("тестовая строка. And some letters - also!");
    });

    it("decodeToken", () => {
        expect(decodeToken(new CharIterator("attachment \"allowed\\\" Quoted values\" and unquoted mixed \"haha ")))
            .eq("attachment allowed\" Quoted values and unquoted mixed haha ");
    });

    it("eatToken", () => {
        expect(eatToken(new CharIterator("attachment "), ";")).eq("attachment");
        expect(eatToken(new CharIterator(" param* = UTF-8'en'test"), "=")).eq("param*");
        expect(eatToken(new CharIterator("  UTF-8'en'test"), "'")).eq("UTF-8");
    });

    describe("parseContentDisposition", () => {

        const examples: {[k:string]: ContentDisposition} = {
            'inline': { type: "inline", params: {} },
            'inline ; ': { type: "inline", params: {} },
            'attachment': { type: "attachment", params: {} },
            'attachment; filename="filename.jpg"': { type: "attachment", params: { filename: { value: "filename.jpg" } } },
            'form-data': { type: "form-data", params: {} },
            'form-data ; name="fieldName"': {type: "form-data", params: {name: { value:"fieldName" } } },
            'form-data; name="fieldName"; filename="filename.jpg"': { type: "form-data", params: { name: { value: "fieldName" }, filename: { value: "filename.jpg" } } },
            "attachment ; filename=\"[rutracker.org].t3400938.torrent\"; filename*=UTF-8''%D0%92%D0%BE%D1%80%D0%BE%D0%BD%D0%B8%D0%BD%D1%8B%20%D0%A1%D0%B5%D0%B7%D0%BE%D0%BD%208%20%D0%A1%D0%B5%D1%80%D0%B8%D0%B8%201-20%20%D0%B8%D0%B7%2020%20%28141-160%20%D0%B8%D0%B7%20160%29%20%28%D0%90%D0%BB%D0%B5%D0%BA%D1%81%D0%B0%D0%BD%D0%B4%D1%80%20%D0%96%D0%B8%D0%B3%D0%B0%D0%BB%D0%BA%D0%B8%D0%BD%29%20%5B2011%2C%20%D0%BA%D0%BE%D0%BC%D0%B5%D0%B4%D0%B8%D1%8F%2C%20%D1%81%D0%B5%D0%BC%D0%B5%D0%B9%D0%BD%D0%BE%D0%B5%20%D0%BA%D0%B8%D0%BD%D0%BE%2C%20IPTVRip%5D%20%5Brutracker-3400938%5D.torrent": {
                type: "attachment",
                params: {
                    filename: {
                        value: "[rutracker.org].t3400938.torrent",
                        extValue: "Воронины Сезон 8 Серии 1-20 из 20 (141-160 из 160) (Александр Жигалкин) [2011, комедия, семейное кино, IPTVRip] [rutracker-3400938].torrent",
                        encoding: "UTF-8",
                        language: ""
                    }
                }
            },
            "attachment; filename=\"[sq]withquotes.torrent\"": { type: "attachment", params: { filename: { value: "[sq]withquotes.torrent" } } },
            "attachment; filename*=UTF-8''weird%20%23%20%80%20%3D%20%7B%20%7D%20%3B%20filename.txt": {
                type: "attachment",
                params: {
                    filename: {
                        encoding: "UTF-8",
                        language: "",
                        extValue: "weird # � = { } ; filename.txt"
                    }
                }
            },
            "attachment; filename=\"Alpine%20Raspberry%20Pi%203.16.0%20aarch64%20TAR%20GZ.torrent\"": {
                type: "attachment",
                params: {
                    filename: {
                        value: "Alpine Raspberry Pi 3.16.0 aarch64 TAR GZ.torrent"
                    }
                }
            },
            "  weird case ;=empty param": {
                type: "weird case",
                params: {
                    "": { value: "empty param" }
                }
            },
            "empty ext param; * = UTF-8'en'ext ; = val ": {
                type: "empty ext param",
                params: {
                    "": { value: "val", encoding: "UTF-8", language: "en", extValue: "ext" }
                }
            },
            "unknown encoding;* = enc'en'ext": {
                type: "unknown encoding",
                params: {
                    "": { encoding: "enc", language: "en", extValue: "ext" }
                }
            }
        };

        for (const e in examples) {
            it("must parse: " + e, () => {
                expect(parseContentDisposition(e)).deep.eq(examples[e]);
            });
        }

    });

    describe("getFileNameFromContentDisposition", () => {

        const expectations: {[k: string]: string | null } = {
            "attachment; filename=\"[sq]withquotes.torrent\"": "[sq]withquotes.torrent",
            "attachment; filename*=UTF-8''weird%20%23%20%80%20%3D%20%7B%20%7D%20%3B%20filename.txt": "weird # � = { } ; filename.txt",
            "attachment; filename=\"Alpine%20Raspberry%20Pi%203.16.0%20aarch64%20TAR%20GZ.torrent\"": "Alpine Raspberry Pi 3.16.0 aarch64 TAR GZ.torrent",
            "attachment": null,
        }

        for (const k in expectations) {
            it("must parse: " + k, () => {
                expect(getFileNameFromContentDisposition(k)).eq(expectations[k]);
            });
        }

        it("must return null on null string", () => {
            expect(getFileNameFromContentDisposition(null)).is.null;
        });
    });

});