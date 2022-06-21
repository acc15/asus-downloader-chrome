import "mocha";

import {expect} from "chai";
import {detectUrlKind, isMagnetUrl, UrlKind} from "./urls";
import {testMagnetLink} from "./utils.spec";

describe("urls", () => {
    describe("isMagnetUrl", () => {
        it("must correctly detect magnet urls", () => {
            expect(isMagnetUrl(testMagnetLink)).is.true;
            expect(isMagnetUrl("http://abc")).is.false;
        });
    });

    describe("detectUrlKind", () => {
        it("must correctly detect magnet urls", () => {
            expect(detectUrlKind(testMagnetLink)).eq(UrlKind.Magnet);
            expect(detectUrlKind("ed2k://xxx")).eq(UrlKind.Ed2k);
            expect(detectUrlKind("ftp://xxx")).eq(UrlKind.Ftp);
            expect(detectUrlKind("http://abc")).eq(UrlKind.Unknown);
            expect(detectUrlKind("https://abc")).eq(UrlKind.Unknown);
        });
    });
});
