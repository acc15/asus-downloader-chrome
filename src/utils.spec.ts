import {expect} from 'chai';
import "mocha";
import {getFileNameFromCD} from "./utils";

describe("utils", () => {
    describe("getFileNameFromCD", () => {
        it("must correctly parse Content-Disposition header", () => {
            expect(getFileNameFromCD("attachment; filename=\"[sq]withquotes.torrent\""))
                .eq("[sq]withquotes.torrent");

            expect(getFileNameFromCD("attachment; filename*=UTF-8''weird%20%23%20%80%20%3D%20%7B%20%7D%20%3B%20filename.txt"))
                .eq("weird # � = { } ; filename.txt");

            expect(getFileNameFromCD("attachment; filename=[sb]without-quotes.torrent"))
                .eq("[sb]without-quotes.torrent");

        });
    });
});
