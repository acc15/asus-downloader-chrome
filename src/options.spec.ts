import {expect} from "chai";
import {normalizeUrl} from "./options";
import {dataDriven} from "./test-util.spec";

describe("options", () => {
    describe("normalizeUrl", () => dataDriven([
        { data: "http://abc////", expect: "http://abc" },
        { data: "http://abc/", expect: "http://abc" },
        { data: "http://abc", expect: "http://abc" }
    ], d => expect(normalizeUrl(d.data)).eq(d.expect)));
});
