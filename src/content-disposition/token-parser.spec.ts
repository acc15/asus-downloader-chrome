import CharRange from "./char-range";
import {dataEq} from "../test-util.spec";
import TokenParser from "./token-parser";

describe("token-parser", () => {

    const p = TokenParser.createDefault();

    describe("decode", () => dataEq([
        {
            data: "%D1%82%D0%B5%D1%81%D1%82%D0%BE%D0%B2%D0%B0%D1%8F %D1%81%D1%82%D1%80%D0%BE%D0%BA%D0%B0. And some letters - also!",
            expect: "тестовая строка. And some letters - also!"
        },
        {
            data: 'attachment; filename=[LimeTorrents.lol][WORLD.PG.ANIME].æ¯\x8Dã\x81\x8Cã\x83\x80ã\x83¼ã\x82¯ã\x82¨ã\x83«ã\x83\x95ã\x81«ã\x81ªã\x81£ã\x81¦ç\x95°ä¸\x96ç\x95\x8Cã\x81\x8Bã\x82\x89æ\x88»ã\x81£ã\x81¦ã\x81\x8Dã\x81\x9Fã\x80\x82.ï½\x9Eã\x82¨ã\x83­ã\x82¨ã\x83­ã\x81§ã\x81\x8Dã\x81¡ã\x82\x83ã\x81\x86.torrent',
            expect: "attachment; filename=[LimeTorrents.lol][WORLD.PG.ANIME].母がダークエルフになって異世界から戻ってきた。.～エロエロできちゃう.torrent"
        },
        {
            data: 'тест',
            expect: 'тест'
        },
        {
            data: 'abc\\" ',
            expect: 'abc\\" '
        }
    ], d => p.decode(d)));

    describe("eat", () => dataEq([
        { data: { str: "attachment ", stop: ';' }, expect: "attachment" },
        { data: { str: " param* = UTF-8'en'test", stop: "=" }, expect: "param*" },
        { data: { str: "  UTF-8'en'test", stop: "'" }, expect: "UTF-8" },
        { data: { str: "attachment \"allowed\\\": Quoted values\" and unquoted mixed  : haha", stop: ":" }, expect: "attachment allowed\": Quoted values and unquoted mixed" },
        { name: "must keep spaces between quoted chunks", data: { str: " \"\" \"\"  ", stop: ":" }, expect: " " },
        { name: "must keep spaces in quoted chunk", data: { str: " \"   \" ", stop: ":" }, expect: "   " },
        { name: "allows to escape spaces", data: { str: " \\ x\\  ", stop: ":" }, expect: " x " },
    ], d => p.parse(new CharRange(d.str), d.stop)));

});