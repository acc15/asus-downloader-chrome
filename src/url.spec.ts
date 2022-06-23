import {expect} from "chai";
import {normalizeUrl} from "./options";
import {getProtoByUrl, isMagnetUrl, Proto} from "./url";
import {testMagnetLink} from "./util.spec";

describe("url", () => {
    describe("isMagnetUrl", () => {
        it("must correctly detect magnet urls", () => {
            expect(isMagnetUrl(testMagnetLink)).is.true;
            expect(isMagnetUrl("http://abc")).is.false;
        });
    });

    describe("detectProto", () => {
        it("must correctly detect magnet urls", () => {
            expect(getProtoByUrl(testMagnetLink)).eq(Proto.Magnet);
            expect(getProtoByUrl("ed2k://xxx")).eq(Proto.Ed2k);
            expect(getProtoByUrl("ftp://xxx")).eq(Proto.Ftp);
            expect(getProtoByUrl("http://abc")).eq(Proto.Unknown);
            expect(getProtoByUrl("https://abc")).eq(Proto.Unknown);
        });
    });



});
