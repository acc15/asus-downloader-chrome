import {dataEq} from "./test-util.spec";
import {getProtoByUrl, isMagnetUrl, Proto} from "./url";
import {testMagnetLink} from "./util.spec";

describe("url", () => {
    describe("isMagnetUrl", () => dataEq([
        { data: testMagnetLink, expect: true },
        { data: "http://abc", expect: false },
    ], d => isMagnetUrl(d)));

    describe("detectProto", () => dataEq([
        { data: testMagnetLink, expect: Proto.Magnet },
        { data: "ed2k://xxx", expect: Proto.Ed2k },
        { data: "ftp://xxx", expect: Proto.Ftp },
        { data: "http://abc", expect: Proto.Unknown },
        { data: "https://abc", expect: Proto.Unknown }
    ], d => getProtoByUrl(d)));

});
